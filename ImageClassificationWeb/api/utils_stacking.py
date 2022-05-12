import json
import os
import pickle

import numpy as np
from keras.models import load_model
from api.utils import ModelUtils, load_img_to_numpy, PredMethod, get_img_size, reset_keras, MlMethod, LABELS_PRIMARY, RESOURCES_DIR

from api.utils_preprocessing import get_image_from_data_url
from api.models import StackingModel


class Stacking(ModelUtils):
    """ Methods for prediction with stacking classifier """

    @staticmethod
    def reload(model_name):
        """
        Reload model from file

        :param model_name: model name
        :return:
            * root_dir : base directory ame
            * base_names : list of weak models' filenames
            * final_classifier : final classifier's instance
            * model_name : full name - id of bagging model
        """

        record = StackingModel.get(model_name.lower())
        root_dir = os.path.join(RESOURCES_DIR, MlMethod.STACKING.value, record.base_dir)
        base_names = []

        for i, name in enumerate(str(record.base_title).split('_')):
            for fold_id in range(record.n_folds):
                filename = f"{record.base_dir}_estId-{name}_{i}_foldId-{fold_id}.h5"
                base_names.append(filename)

        final_classif_filename = os.path.join(root_dir, f'{record.base_dir}_final.h5')
        final_classifier = pickle.load(open(final_classif_filename, 'rb'))

        return root_dir, base_names, final_classifier, model_name

    @staticmethod
    def predict_single(file, img_size, root_dir, base_names, final_classifier):
        """
        Predict single image

        :param file: image file
        :param img_size: image size
        :param root_dir: root directory where model is saved
        :param base_names: names of models
        :param final_classifier: final meta-classifier
        :return:
            *  pred_y - predictions (probabilities) from meta-classifier
        """

        # convert image to numpy array
        np_image = load_img_to_numpy(file, img_size)
        # create stacked dataset and predict with meta-classifier
        preds = get_stacking_preds(root_dir, base_names, np_image)
        stackX = create_stacked_dataset(preds)
        pred_y = final_classifier.predict_proba(stackX)
        return pred_y

    @staticmethod
    def predict_multiple(files, img_size, root_dir, base_names, final_classifier):
        """
        Predict multiple images

        :param files: list of image files
        :param img_size: image size
        :param root_dir: root directory where model is saved
        :param base_names: names of models
        :param final_classifier: final meta-classifier
        :return:
            * pred_y - predictions (probabilities) from meta-classifier
        """

        # convert images to numpy array
        img_list = []
        for file in files:
            np_image = load_img_to_numpy(file, img_size)
            img_list.append(np_image)

        # create stacked dataset and predict with meta-classifier
        preds = get_stacking_preds(root_dir, base_names, np.vstack(img_list))
        stackX = create_stacked_dataset(preds)
        pred_y = final_classifier.predict_proba(stackX)
        return pred_y

    @staticmethod
    def predict(post, pred_method):
        """
        Predict with stacking classifier - main

        :param post: POST request
        :param pred_method: prediction method (single/multi)
        :return:
            * results - result label names
            * pred_list - predictions (probabilities)
            * classes - list of all class names
            * id_list : list of image ids
        """
        results, pred_list, classes, id_list = json.dumps([]), json.dumps([]), json.dumps([]), json.dumps([])

        # reload classifiers
        model_name = post['model_name'].lower()
        root_dir, base_names, final_classifier, _ = Stacking.reload(post['model_name'])

        # predict single image
        if pred_method == PredMethod.SINGLE.value:
            # read image from data URL
            image = post['image']
            file = get_image_from_data_url(data_url=image)
            # predict image
            pred = Stacking.predict_single(file, get_img_size(model_name), root_dir, base_names, final_classifier)
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
            preds = Stacking.predict_multiple(files, get_img_size(model_name), root_dir, base_names, final_classifier)

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


def get_stacking_preds(root_dir, base_names, data):
    """
    Predict with stacking model

    :param root_dir: root directory where model is saved
    :param base_names: names of models
    :param data: input data (numpy array)
    :return:
        * pred_dict : dictionary of predictions dict{filename:predictions}
    """
    pred_dict: dict = {}
    for model_name in base_names:
        base_model = load_model(os.path.join(root_dir, model_name), compile=False)
        model_pred_name = model_name.split('_foldId')[0]
        base_y_pred = base_model.predict(data, verbose=0, batch_size=10)
        reset_keras(base_model)

        if model_pred_name not in pred_dict:
            pred_dict[model_pred_name] = []
        pred_dict[model_pred_name].append(base_y_pred)

    for mdl_name in pred_dict.keys():
        pred_nparray = np.array([x for x in pred_dict[mdl_name]])
        pred_dict[mdl_name] = np.mean(pred_nparray, axis=0)

    return pred_dict


def create_stacked_dataset(pred_dict):
    """
    Create dataset for final classifier
    :param pred_dict: predictions of each weak classifier
    :return:
        * stackX : stacked dataset
    """
    stackX = None
    for model_name, preds in pred_dict.items():
        stackX = preds if stackX is None else np.dstack((stackX, preds))

    # flatten predictions to [rows, members x probabilities]
    stackX = stackX.reshape(
        (stackX.shape[0], stackX.shape[1] * stackX.shape[2])
    )
    return stackX
