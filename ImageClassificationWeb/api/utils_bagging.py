import json
import os

import numpy as np
from keras.models import load_model

from api.models import BaggingModel
from api.utils import load_img_to_numpy, ModelUtils, get_img_size, reset_keras, PredMethod, MlMethod, LABELS_PRIMARY, RESOURCES_DIR
from api.utils_preprocessing import get_image_from_data_url


class Bagging(ModelUtils):
    """ Methods for prediction with bagging classifier """

    @staticmethod
    def reload(model_name, n_estimators):
        """
        Reload model from file

        :param n_estimators: number of estimators
        :param model_name: model name
        :return: 
            * record.base_dir : base directory ame
            * base_names : list of weak models' filenames
            * model_name_full : full name - id of bagging model
        """
        model_name_full = f"{model_name}_{n_estimators}"
        record = BaggingModel.get(model_name_full)
        base_names = [f"{record.base_dir}_estId-{record.title}_{i}.h5" for i in range(record.n_estimators)]
        return record.base_dir, base_names, model_name_full

    @staticmethod
    def predict_single(file, img_size, root_dir, base_names):
        """
         Predict single image

        :param file: image file
        :param img_size: image size
        :param root_dir: root directory where model is saved
        :param base_names: names of models
        :return:
            *  pred_y : predictions (probabilities) from bagging classifier
        """
        # convert image to numpy array
        np_image = load_img_to_numpy(file, img_size)

        # predict with each weak classifier
        predictions = []
        for model_name in base_names:
            model = load_model(os.path.join(RESOURCES_DIR, MlMethod.BAGGING.value, root_dir, model_name), compile=False)
            pred = model.predict(np_image, verbose=0)
            reset_keras(model)
            predictions.append(pred)

        # sum across ensemble members
        summed = np.sum(np.array(predictions), axis=0)
        pred_y = summed / len(base_names)

        return pred_y

    @staticmethod
    def predict_multiple(files, img_size, root_dir, base_names):
        """
        Predict multiple images

        :param files: list of image files
        :param img_size: image size
        :param root_dir: root directory where model is saved
        :param base_names: names of models
        :return:
            *  pred_y : predictions (probabilities) from bagging classifier
        """

        # convert images to numpy array
        img_list = []
        for file in files:
            np_image = load_img_to_numpy(file, img_size)
            img_list.append(np_image)

        # predict with each weak classifier
        predictions = []
        for model_name in base_names:
            model = load_model(os.path.join(RESOURCES_DIR, MlMethod.BAGGING.value, root_dir, model_name), compile=False)
            pred = model.predict(np.vstack(img_list), batch_size=30, verbose=0)
            reset_keras(model)
            predictions.append(pred)

        # sum across ensemble members
        summed = np.sum(np.array(predictions), axis=0)
        pred_y = summed / len(base_names)

        return pred_y

    @staticmethod
    def predict(post, pred_method):
        """
        Predict with bagging classifier - main method

        :param post: POST request
        :param pred_method: prediction method (single/multi)
        :return:
            * results : result label names
            * pred_list : predictions (probabilities)
            * classes : list of all class names
            * id_list : list of image ids
        """
        results, pred_list, classes, id_list = json.dumps([]), json.dumps([]), json.dumps([]), json.dumps([])
        print(post)
        # reload weak classifiers
        model_name = post['model_name'].lower()
        root_dir, base_names, _ = Bagging.reload(post['model_name'], int(post['n_estimators']))

        # predict single image
        if pred_method == PredMethod.SINGLE.value:
            # read image from data URL
            image = post['image']
            file = get_image_from_data_url(data_url=image)
            # predict image
            pred = Bagging.predict_single(file, get_img_size(model_name), root_dir, base_names)
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
            preds = Bagging.predict_multiple(files, get_img_size(model_name), root_dir, base_names)
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

        return results, pred_list, classes, id_list
