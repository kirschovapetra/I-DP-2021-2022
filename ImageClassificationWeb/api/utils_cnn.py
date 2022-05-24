import json
import logging
import os

import numpy as np
from keras.models import load_model

from api.models import CnnModel
from api.utils import ModelUtils, load_img_to_numpy, get_img_size, reset_keras, PredMethod, MlMethod, LABELS_PRIMARY, RESOURCES_DIR
from api.utils_preprocessing import get_image_from_data_url


class Cnn(ModelUtils):
    """ Methods for prediction with baseline cnn classifier """

    @staticmethod
    def reload(model_name):
        """
        Reload model from file

        :param model_name: model name
        :return: loaded model
        """

        record = CnnModel.get(model_name)
        print(record)
        logging.getLogger('django').info(str(record))
        model_path = os.path.join(RESOURCES_DIR, MlMethod.CNN.value, record.filename)
        model = load_model(model_path, compile=False)
        return model, model_name

    @staticmethod
    def predict_single(file, img_size, model):
        """
        Predict single image

        :param file: image file
        :param img_size: image size
        :param model: cnn model
        :return:
            *  pred_y - predictions (probabilities) from cnn classifier
        """

        # convert images to numpy array
        np_image = load_img_to_numpy(file, img_size)
        print(np_image.shape)
        logging.getLogger('django').info(str(np_image.shape))
        # predict with cnn classifier
        pred_y = model.predict(np_image, verbose=0)
        return pred_y

    @staticmethod
    def predict_multiple(files, img_size, model):
        """
        Predict multiple images

        :param files: list of image files
        :param img_size: image size
        :param model: cnn model
        :return:
            *  pred_y - predictions (probabilities) from cnn classifier
        """

        # convert images to numpy array
        img_list = []
        for file in files:

            np_image = load_img_to_numpy(file, img_size)
            img_list.append(np_image)

        # predict stacked images with cnn classifier
        pred_y = model.predict(np.vstack(img_list), batch_size=30, verbose=0)
        return pred_y

    @staticmethod
    def predict(post, pred_method):
        """
        Predict with cnn classifier - main

        :param post: POST request
        :param pred_method: prediction method (single/multi)
        :return:
            * results - result label names
            * pred_list - predictions (probabilities)
            * classes - list of all class names
        """

        results, pred_list, classes, id_list = json.dumps([]), json.dumps([]), json.dumps([]), json.dumps([])

        # reload classifier
        model_name = post['model_name'].lower()
        model, _ = Cnn.reload(model_name)

        # predict single image
        if pred_method == PredMethod.SINGLE.value:
            # read image from data URL
            image = post['image']
            file = get_image_from_data_url(data_url=image)
            # predict image
            pred = Cnn.predict_single(file, get_img_size(model_name), model)
            # map results
            pred_list = json.dumps([x.item() for x in pred[0] * 100])
            results = json.dumps([int(np.argmax(pred, axis=1)[0])])
            classes = json.dumps(LABELS_PRIMARY)

        # predict multiple images
        elif pred_method == PredMethod.MULTI.value:
            # read images from data URL
            image_list = eval(post['image_list'])
            id_list = json.dumps(eval(post['id_list']))
            files = [get_image_from_data_url(data_url=image_url) for image_url in image_list]
            # predict images
            preds = Cnn.predict_multiple(files, get_img_size(model_name), model)

            # re-map predictions and classes to json-serializable format
            pred_list_percent = []
            for pred_single in preds:
                percent_single = [x.item() for x in pred_single * 100]
                pred_list_percent.append(percent_single)

            class_list = []
            for i in range(len(files)):
                class_list.append(LABELS_PRIMARY)

            # map results
            pred_list = json.dumps(pred_list_percent)
            results = json.dumps([int(float(itm)) for itm in np.argmax(preds, axis=1)])
            classes = json.dumps(class_list)

        # erase classifier from memory
        reset_keras(model)
        return results, pred_list, classes, id_list
