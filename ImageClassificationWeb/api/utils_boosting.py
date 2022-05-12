import json
import os
import numpy as np
import xgboost as xgb
from api.models import BoostingModel
from api.utils import load_img_to_numpy, ModelUtils, get_img_size, reset_keras, extract_from_layer, PredMethod, MlMethod, LABELS_PRIMARY, RESOURCES_DIR
from api.utils_cnn import Cnn
from api.utils_preprocessing import get_image_from_data_url


class Boosting(ModelUtils):
    """ Methods for prediction with boosting classifier """

    @staticmethod
    def reload(model_name):
        """
        Reload model from file

        :param model_name: model name
        :return:
            * model_cnn : loaded cnn model
            * model_xgb : loaded xgb model
            * model_name : full name - id of bagging model
        """

        record = BoostingModel.get(model_name)
        model_cnn, _ = Cnn.reload(record.name)
        model_xgb = xgb.Booster()
        model_path = os.path.join(RESOURCES_DIR, MlMethod.BOOSTING.value, record.filename)
        model_xgb.load_model(model_path)

        return model_cnn, model_xgb, model_name

    @staticmethod
    def predict_single(file, img_size, model_cnn, model_xgb):
        """
        Predict single image

        :param file: list of image files
        :param img_size: image size
        :param model_cnn: cnn model
        :param model_xgb: xgboost model
        :return:
            *  pred_y - predictions (probabilities) from xgboost classifier
        """

        # convert image to numpy array
        np_image = load_img_to_numpy(file, img_size)
        # extract features from 'flatten' layer of baseline cnn model
        X_test_features = extract_from_layer(np_image, model_cnn, "flatten")
        # predict features with xgboost
        pred_y = model_xgb.predict(xgb.DMatrix(X_test_features))
        return pred_y

    @staticmethod
    def predict_multiple(files, img_size, model_cnn, model_xgb):
        """
        Predict multiple images

        :param files: image files
        :param img_size: image size
        :param model_cnn: cnn model
        :param model_xgb: xgboost model
        :return:
            *  pred_y - predictions (probabilities) from xgboost classifier
        """
        # convert images to numpy array
        img_list = []
        for name in files:
            np_image = load_img_to_numpy(name, img_size)
            img_list.append(np_image)

        # extract features from 'flatten' layer of baseline cnn model
        X_test_features = extract_from_layer(np.vstack(img_list), model_cnn, "flatten")
        # predict features with xgboost
        pred_y = model_xgb.predict(xgb.DMatrix(X_test_features))
        return pred_y

    @staticmethod
    def predict(post, pred_method):
        """
        Predict with boosting classifier - main

        :param post: POST request
        :param pred_method: prediction method (single/multi)
        :return:
            * results - result label names
            * pred_list - predictions (probabilities)
            * classes - list of all class names
            * id_list : list of image ids
        """

        results, pred_list, classes, id_list = json.dumps([]), json.dumps([]), json.dumps([]), json.dumps([])

        # reload baseline and xgboost classifiers
        model_name = post['model_name'].lower()
        model_cnn, model_xgb, _ = Boosting.reload(post['model_name'])

        # predict single image
        if pred_method == PredMethod.SINGLE.value:
            # read image from data URL
            image = post['image']
            file = get_image_from_data_url(data_url=image)
            # predict image
            pred = Boosting.predict_single(file, get_img_size(model_name), model_cnn, model_xgb)
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
            preds = Boosting.predict_multiple(files, get_img_size(model_name), model_cnn, model_xgb)

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

        # erase classifiers from memory
        reset_keras(model_cnn)
        reset_keras(model_xgb)

        return results, pred_list, classes, id_list
