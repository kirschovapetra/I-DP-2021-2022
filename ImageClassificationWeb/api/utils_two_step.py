import json
import os

import numpy as np
from keras.models import load_model

from api.models import TwoStepModel
from api.utils import ModelUtils, get_img_size, PredMethod, reset_keras, load_img_to_numpy, MlMethod, LABELS_SECONDARY, RESOURCES_DIR
from api.utils_bagging import Bagging
from api.utils_boosting import Boosting
from api.utils_cnn import Cnn
from api.utils_preprocessing import get_image_from_data_url
from api.utils_stacking import Stacking


class TwoStep(ModelUtils):
    """ Methods for prediction with two-step classifier """

    @staticmethod
    def reload(classifierId, primary_name, primary_method, secondary_name):
        """
        Reload model from file
        :param classifierId: index of secondary classifier (0-9)
        :param primary_name: name of primary classifier
        :param primary_method: method of primary classifier
        :param secondary_name: name of secondary classifier
        :return: loaded model
        """
        record = TwoStepModel.get(f"{primary_method.lower()}+{primary_name.lower()}+{secondary_name.lower()}")
        print(record)
        sec_path = os.path.join(RESOURCES_DIR, MlMethod.TWO_STEP.value, classifierId, record.base_dir, f'{record.base_dir}.h5')
        return load_model(sec_path, compile=False)

    @staticmethod
    def predict_single(file, primary_pred_class, primary_name, primary_method, secondary_name):
        """
        Predict single image

        :param file: image file
        :param primary_pred_class: class predicted with primary classifier
        :param primary_name: name of primary classifier
        :param primary_method: method of primary classifier
        :param secondary_name: name of secondary classifier
        :return:
            *  pred_y - predictions (probabilities) from secondary classifier
        """
        # convert image to numpy array
        np_image = load_img_to_numpy(file, get_img_size(secondary_name))
        # reload and predict with secondary classifier
        sec_model = TwoStep.reload(str(primary_pred_class), primary_name, primary_method, secondary_name)
        pred_y = sec_model.predict(np_image, verbose=0)
        reset_keras(sec_model)
        return pred_y

    @staticmethod
    def predict_multiple(files, primary_pred_classes, primary_name, primary_method, secondary_name):
        """
        Predict multiple images

        :param files: list of image files
        :param primary_pred_classes: list of classes predicted with primary classifier
        :param primary_name: name of primary classifier
        :param primary_method: method of primary classifier
        :param secondary_name: name of secondary classifier
        :return:
            * pred_y - predictions (probabilities) from secondary classifier
        """

        # loop and predict over all images
        pred_y = []
        for i in range(len(files)):
            pred_single = TwoStep.predict_single(file=files[i], primary_pred_class=str(primary_pred_classes[i]),
                                                 primary_name=primary_name, primary_method=primary_method,
                                                 secondary_name=secondary_name)[0]
            # padded with '0' since not all predictions are the same size
            pred_y.append(np.pad(pred_single, (0, 10 - len(pred_single)), mode='constant'))

        return pred_y

    @staticmethod
    def get_primary_preds(post, pred_method):
        """
        Predict with primary model
        :param post: post request
        :param pred_method: prediction method - single / multi
        :return:
            * primary_pred_classes : predicted classes
            * primary_name_full : full name - id of primary model
        """

        primary_name = post['primary_name']
        primary_method = post['primary_method']
        primary_model = None
        primary_pred_classes = None
        primary_name_full = None
        if primary_method == MlMethod.CNN.value:
            primary_model, primary_name_full = Cnn.reload(primary_name)
            if pred_method == PredMethod.SINGLE.value:
                image = post['image']
                file = get_image_from_data_url(data_url=image)
                primary_pred = Cnn.predict_single(file, get_img_size(primary_name), primary_model)
                primary_pred_classes = [int(np.argmax(primary_pred, axis=1)[0])]
            elif pred_method == PredMethod.MULTI.value:
                image_list = eval(post['image_list'])
                files = [get_image_from_data_url(data_url=image_url) for image_url in image_list]
                primary_pred = Cnn.predict_multiple(files, get_img_size(primary_name), primary_model)
                primary_pred_classes = [int(float(itm)) for itm in np.argmax(primary_pred, axis=1)]

        elif primary_method == MlMethod.BAGGING.value:
            root_dir, base_names, primary_name_full = Bagging.reload(primary_name, int(post['n_estimators']))
            if pred_method == PredMethod.SINGLE.value:
                image = post['image']
                file = get_image_from_data_url(data_url=image)
                primary_pred = Bagging.predict_single(file, get_img_size(primary_name), root_dir, base_names)
                primary_pred_classes = [int(np.argmax(primary_pred, axis=1)[0])]
            elif pred_method == PredMethod.MULTI.value:
                image_list = eval(post['image_list'])
                files = [get_image_from_data_url(data_url=image_url) for image_url in image_list]
                primary_pred = Bagging.predict_multiple(files, get_img_size(primary_name), root_dir, base_names)
                primary_pred_classes = [int(float(itm)) for itm in np.argmax(primary_pred, axis=1)]

        elif primary_method == MlMethod.BOOSTING.value:
            primary_model_cnn, primary_model_xgb, primary_name_full = Boosting.reload(primary_name)

            if pred_method == PredMethod.SINGLE.value:
                image = post['image']
                file = get_image_from_data_url(data_url=image)
                primary_pred = Boosting.predict_single(file, get_img_size(primary_name), primary_model_cnn, primary_model_xgb)
                primary_pred_classes = [int(np.argmax(primary_pred, axis=1)[0])]
            elif pred_method == PredMethod.MULTI.value:
                image_list = eval(post['image_list'])
                files = [get_image_from_data_url(data_url=image_url) for image_url in image_list]
                primary_pred = Boosting.predict_multiple(files, get_img_size(primary_name), primary_model_cnn, primary_model_xgb)
                primary_pred_classes = [int(float(itm)) for itm in np.argmax(primary_pred, axis=1)]

        elif primary_method == MlMethod.STACKING.value:
            root_dir, base_names, final_classifier, primary_name_full = Stacking.reload(primary_name)
            if pred_method == PredMethod.SINGLE.value:
                image = post['image']
                file = get_image_from_data_url(data_url=image)
                primary_pred = Stacking.predict_single(file, get_img_size(primary_name), root_dir, base_names, final_classifier)
                primary_pred_classes = [int(np.argmax(primary_pred, axis=1)[0])]
            elif pred_method == PredMethod.MULTI.value:
                image_list = eval(post['image_list'])
                files = [get_image_from_data_url(data_url=image_url) for image_url in image_list]
                primary_pred = Stacking.predict_multiple(files, get_img_size(primary_name), root_dir, base_names, final_classifier)
                primary_pred_classes = [int(float(itm)) for itm in np.argmax(primary_pred, axis=1)]

        reset_keras(primary_model)
        return primary_pred_classes, primary_name_full

    @staticmethod
    def predict(post, pred_method):
        """
        Predict with two-step classifier - main

        :param post: POST request
        :param pred_method: prediction method (single/multi)
        :return:
            * results - result label names
            * pred_list - predictions (probabilities)
            * classes - list of all class names
            * id_list : list of image ids
        """
        results, pred_list, classes, id_list = json.dumps([]), json.dumps([]), json.dumps([]), json.dumps([])
        primary_pred_classes, primary_name_full = TwoStep.get_primary_preds(post, pred_method)

        primary_method = post['primary_method']
        secondary_name = post['model_name']
        if pred_method == PredMethod.SINGLE.value:
            # read image from data URL
            image = post['image']
            file = get_image_from_data_url(data_url=image)
            # predict image with secondary classifier
            secondary_pred = TwoStep.predict_single(file=file, primary_pred_class=primary_pred_classes[0],
                                                    primary_name=primary_name_full, primary_method=primary_method,
                                                    secondary_name=secondary_name)
            secondary_pred_classes = [int(np.argmax(secondary_pred, axis=1)[0])]

            # class group based on result class from primary dataset
            sec_classes_group = LABELS_SECONDARY[primary_pred_classes[0]]
            # result class' string representation
            secondary_class_result = sec_classes_group[secondary_pred_classes[0]]

            # map results
            pred_list = json.dumps([x.item() for x in secondary_pred[0] * 100])
            results = json.dumps([secondary_class_result])
            classes = json.dumps(sec_classes_group)

        # predict multiple images
        elif pred_method == PredMethod.MULTI.value:
            image_list = eval(post['image_list'])
            id_list = json.dumps(eval(post['id_list']))
            files = [get_image_from_data_url(data_url=image_url) for image_url in image_list]
            # predict images with secondary classifier
            secondary_pred = TwoStep.predict_multiple(files=files, primary_pred_classes=primary_pred_classes,
                                                      primary_name=primary_name_full, primary_method=primary_method,
                                                      secondary_name=secondary_name)
            secondary_pred_classes = np.argmax(secondary_pred, axis=1)

            # re-map predictions and classes to json-serializable format
            secondary_class_results = []
            classes_list = []
            for i in range(len(primary_pred_classes)):
                # class group based on result class from primary dataset
                sec_classes_group = LABELS_SECONDARY[primary_pred_classes[i]]
                # result class' string representation
                secondary_class_results.append(sec_classes_group[int(secondary_pred_classes[i])])
                # all classes' string representation
                classes_list.append(sec_classes_group)

            pred_list_percent = []
            for pred_single in secondary_pred:
                percent_single = [x.item() for x in pred_single * 100]
                pred_list_percent.append(percent_single)

            # map results
            pred_list = json.dumps(pred_list_percent)
            results = json.dumps(secondary_class_results)
            classes = json.dumps(classes_list)

        return results, pred_list, classes, id_list
