import enum
import itertools
import os
import gc
from abc import abstractmethod
from keras.backend import get_session, clear_session, set_session
import numpy as np
from PIL import Image
from skimage import transform
import tensorflow as tf
import logging
from skimage.color import rgba2rgb
from api.models import CnnModel, BoostingModel, BaggingModel, StackingModel, TwoStepModel

os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'
os.environ['CUDA_VISIBLE_DEVICES'] = '-1'
if tf.test.gpu_device_name():
    logging.getLogger('django').info('GPU found')
else:
    logging.getLogger('django').info("No GPU found")

''' --------------------------------- Constants ------------------------------------ '''

RESOURCES_DIR = 'resources/models'

LABELS_PRIMARY = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]

LABELS_SECONDARY = {
    0: ['0', '0^0', '0^2', '0^I', '0^II'],
    1: ['1', '1^0', '1^I', '1^II'],
    2: ['2', '2^2', '2^I', '2^II'],
    3: ['3', '3^0', '3^2', '3^I', '3^II'],
    4: ['4', '4^0', '4^2', '4^I', '4^II'],
    5: ['5', '5^0', '5^2', '5^I', '5^II'],
    6: ['6', '6-I', '6-II', '6^2'],
    7: ['7', '7^0', '7^2', '7^I', '7^II'],
    8: ['8', '8^0', '8^2', '8^I', '8^II'],
    9: ['9', '9-I', '9-II', '9^0', '9^2', '9^I']
}


class CnnName(enum.Enum):
    CUSTOM = 'Custom'
    RESNET50 = 'ResNet50'
    RESNEXT50 = 'ResNeXt50'
    VGG19 = 'VGG19'
    INCEPTIONV3 = 'InceptionV3'


class MlMethod(enum.Enum):
    CNN = 'cnn'
    BAGGING = 'bagging'
    BOOSTING = 'boosting'
    STACKING = 'stacking'
    TWO_STEP = 'two-step'


class PredMethod(enum.Enum):
    SINGLE = 'single'
    MULTI = 'multi'


class ThresholdMode(enum.Enum):
    NONE_THR = 'none_thr'
    OTSU = 'otsu'
    ADAPTIVE = 'adaptive'


class DenoiseMode(enum.Enum):
    NONE_DEN = 'none_den'
    BILATERAL = 'bilateral'
    TV_CHAMBOLLE = 'tv_chambolle'
    NL_MEANS = 'nl_means'


def generate_permutation_strings(list_in):
    perms = list(itertools.permutations(list_in))
    return ['_'.join(list(perm)) for perm in perms]


''' ------------------------------- fill db with defaults ---------------------------------- '''


def insert_cnn():
    CnnModel.drop()
    CnnModel.update_or_create_multiple([
        CnnModel(title=CnnName.CUSTOM.value, filename="Custom_20-horizontal_flip-rotation_range-width_shift_range-height_shift_range.h5"),
        CnnModel(title=CnnName.INCEPTIONV3.value, filename="InceptionV3_20-horizontal_flip-rotation_range-width_shift_range-height_shift_range.h5"),
        CnnModel(title=CnnName.RESNET50.value, filename="ResNet50_20-horizontal_flip-rotation_range-width_shift_range-height_shift_range.h5"),
        CnnModel(title=CnnName.RESNEXT50.value, filename="ResNeXt50_20-horizontal_flip-rotation_range-width_shift_range-height_shift_range.h5"),
        CnnModel(title=CnnName.VGG19.value, filename="VGG19_20-horizontal_flip-rotation_range-width_shift_range-height_shift_range.h5"),
    ])


def insert_bagging():
    BaggingModel.drop()
    BaggingModel.update_or_create_multiple(
        [BaggingModel(title=CnnName.CUSTOM.value, n_estimators=i, base_dir=f"Custom_20-ep_{i}-est") for i in range(2, 5)] +
        [BaggingModel(title=CnnName.INCEPTIONV3.value, n_estimators=i, base_dir=f"InceptionV3_20-ep_{i}-est") for i in range(2, 5)] +
        [BaggingModel(title=CnnName.RESNET50.value, n_estimators=i, base_dir=f"ResNet50_20-ep_{i}-est") for i in range(2, 5)] +
        [BaggingModel(title=CnnName.RESNEXT50.value, n_estimators=i, base_dir=f"ResNeXt50_20-ep_{i}-est") for i in range(2, 5)] +
        [BaggingModel(title=CnnName.VGG19.value, n_estimators=i, base_dir=f"VGG19_20-ep_{i}-est") for i in range(2, 5)]
    )


def insert_boosting():
    BoostingModel.drop()
    BoostingModel.update_or_create_multiple([
        BoostingModel(title=CnnName.CUSTOM.value, filename="Custom_20-ep-cnn_50-ep-xgb_XGBOOST.h5"),
        BoostingModel(title=CnnName.INCEPTIONV3.value, filename="InceptionV3_20-ep-cnn_50-ep-xgb_XGBOOST.h5"),
        BoostingModel(title=CnnName.RESNET50.value, filename="ResNet50_20-ep-cnn_50-ep-xgb_XGBOOST.h5"),
        BoostingModel(title=CnnName.RESNEXT50.value, filename="ResNeXt50_20-ep-cnn_50-ep-xgb_XGBOOST.h5"),
        BoostingModel(title=CnnName.VGG19.value, filename="VGG19_20-ep-cnn_50-ep-xgb_XGBOOST.h5"),
    ])


def insert_stacking():
    StackingModel.drop()
    vrc = [CnnName.VGG19.value, CnnName.RESNET50.value, CnnName.CUSTOM.value]
    vrr = [CnnName.VGG19.value, CnnName.RESNET50.value, CnnName.RESNET50.value]
    vcc = [CnnName.VGG19.value, CnnName.CUSTOM.value, CnnName.CUSTOM.value]
    vvc = [CnnName.VGG19.value, CnnName.VGG19.value, CnnName.CUSTOM.value]
    vvr = [CnnName.VGG19.value, CnnName.VGG19.value, CnnName.RESNET50.value]
    rrc = [CnnName.RESNET50.value, CnnName.RESNET50.value, CnnName.CUSTOM.value]
    rcc = [CnnName.RESNET50.value, CnnName.CUSTOM.value, CnnName.CUSTOM.value]
    vr = [CnnName.VGG19.value, CnnName.RESNET50.value]
    vc = [CnnName.VGG19.value, CnnName.CUSTOM.value]
    cr = [CnnName.CUSTOM.value, CnnName.RESNET50.value]

    StackingModel.update_or_create_multiple(
        [StackingModel(title=title, n_folds=2, base_title="Custom_VGG19_ResNet50", base_dir="Custom_VGG19_ResNet50_20-ep_2-folds") for title in generate_permutation_strings(vrc)] +

        [StackingModel(title=title, n_folds=2, base_title="VGG19_ResNet50_ResNet50", base_dir="VGG19_ResNet50_ResNet50_20-ep_2-folds") for title in generate_permutation_strings(vrr)] +
        [StackingModel(title=title, n_folds=2, base_title="Custom_Custom_VGG19", base_dir="Custom_Custom_VGG19_20-ep_2-folds") for title in generate_permutation_strings(vcc)] +
        [StackingModel(title=title, n_folds=2, base_title="Custom_VGG19_VGG19", base_dir="Custom_VGG19_VGG19_20-ep_2-folds") for title in generate_permutation_strings(vvc)] +
        [StackingModel(title=title, n_folds=2, base_title="VGG19_VGG19_ResNet50", base_dir="VGG19_VGG19_ResNet50_20-ep_2-folds") for title in generate_permutation_strings(vvr)] +

        [StackingModel(title=title, n_folds=2, base_title="Custom_ResNet50_ResNet50", base_dir="Custom_ResNet50_ResNet50_20-ep_2-folds") for title in generate_permutation_strings(rrc)] +
        [StackingModel(title=title, n_folds=2, base_title="Custom_Custom_ResNet50", base_dir="Custom_Custom_ResNet50_20-ep_2-folds") for title in generate_permutation_strings(rcc)] +

        [StackingModel(title=title, n_folds=2, base_title="VGG19_ResNet50", base_dir="VGG19_ResNet50_20-ep_2-folds") for title in generate_permutation_strings(vr)] +
        [StackingModel(title=title, n_folds=2, base_title="Custom_VGG19", base_dir="Custom_VGG19_20-ep_2-folds") for title in generate_permutation_strings(vc)] +
        [StackingModel(title=title, n_folds=2, base_title="Custom_ResNet50", base_dir="Custom_ResNet50_20-ep_2-folds") for title in generate_permutation_strings(cr)] +

        [
            StackingModel(title='Custom_Custom', n_folds=2, base_title="Custom_Custom", base_dir="Custom_Custom_20-ep_2-folds"),
            StackingModel(title='Custom_Custom_Custom', n_folds=2, base_title="Custom_Custom_Custom", base_dir="Custom_Custom_Custom_20-ep_2-folds"),
            StackingModel(title='ResNet50_ResNet50', n_folds=2, base_title="ResNet50_ResNet50", base_dir="ResNet50_ResNet50_20-ep_2-folds"),
            StackingModel(title='ResNet50_ResNet50_ResNet50', n_folds=2, base_title="ResNet50_ResNet50_ResNet50", base_dir="ResNet50_ResNet50_ResNet50_20-ep_2-folds"),
            StackingModel(title='VGG19_VGG19', n_folds=2, base_title="VGG19_VGG19", base_dir="VGG19_VGG19_20-ep_2-folds"),
            StackingModel(title='VGG19_VGG19_VGG19', n_folds=2, base_title="VGG19_VGG19_VGG19", base_dir="VGG19_VGG19_VGG19_20-ep_2-folds"),
        ]
    )


def insert_two_step():
    TwoStepModel.drop()
    two_step_models_all = []

    for sec_model in [c.value for c in CnnName]:
        for cnn_model in CnnModel.get_all():
            two_step_models_all.append(
                TwoStepModel(title=sec_model, primary_method=MlMethod.CNN.value, primary_name_full=cnn_model.name_full, base_dir=f'{sec_model}_20')
            )
        for stack_model in StackingModel.get_all():
            two_step_models_all.append(
                TwoStepModel(title=sec_model, primary_method=MlMethod.STACKING.value, primary_name_full=stack_model.name_full, base_dir=f'{sec_model}_20')
            )
        for bag_model in BaggingModel.get_all():
            two_step_models_all.append(
                TwoStepModel(title=sec_model, primary_method=MlMethod.BAGGING.value, primary_name_full=bag_model.name_full, base_dir=f'{sec_model}_20')
            )
        for boost_model in BoostingModel.get_all():
            two_step_models_all.append(
                TwoStepModel(title=sec_model, primary_method=MlMethod.BOOSTING.value, primary_name_full=boost_model.name_full, base_dir=f'{sec_model}_20')
            )

    TwoStepModel.update_or_create_multiple(two_step_models_all)


try:
    insert_cnn()
    insert_bagging()
    insert_boosting()
    insert_stacking()
    insert_two_step()

except Exception as e:
    print("! DB error: ", e, '\n')

''' ---------------------------------------------------------------------------------------- '''


def reset_keras(obj):
    """
    Clear keras object from memory
    Source: https://github.com/keras-team/keras/issues/12625
    :param obj: object to delete
    """
    #
    sess = get_session()
    clear_session()
    sess.close()
    sess = get_session()

    try:
        del obj
    except:
        pass

    gc.collect()

    config = tf.compat.v1.ConfigProto()
    config.gpu_options.per_process_gpu_memory_fraction = 1
    config.gpu_options.visible_device_list = "0"
    set_session(tf.compat.v1.Session(config=config))


def load_img_to_numpy(file, img_size):
    """
    Convert pillow image to numpy array

    :param file: image file
    :param img_size: image size (height, width)
    :return:
        * np_image - numpy array from image
    """
    np_image = Image.open(file)
    np_image = np.array(np_image).astype('float32') / 255.
    try:
        np_image = rgba2rgb(np_image)
    except:
        pass

    np_image = transform.resize(np_image, img_size + (3,))
    np_image = np.expand_dims(np_image, axis=0)
    return np_image


def extract_from_layer(data, model_cnn, layer_name):
    """
    Extract features from feature layer

    :param data: data iterator
    :param model_cnn: keras model
    :param layer_name: name of the layer to extract features from
    :return:
        * feature_layer_output - output data extracted from the feature layer
    """
    feature_layer_model = tf.keras.Model(
        inputs=model_cnn.input,
        outputs=model_cnn.get_layer(layer_name).output)
    feature_layer_output = feature_layer_model.predict(data)
    return feature_layer_output


class ModelUtils:
    """ Abstract class representing ML model's predictions """

    @staticmethod
    @abstractmethod
    def reload(*args): pass

    @staticmethod
    @abstractmethod
    def predict(*args): pass

    @staticmethod
    @abstractmethod
    def predict_single(*args): pass

    @staticmethod
    @abstractmethod
    def predict_multiple(*args): pass


def get_img_size(name):
    """
    Get image size by CNN's name

    :param name: model name ('VGG19', 'ResNeXt50', 'ResNet50', 'InceptionV3' or 'Custom')
    :return:
       * img_size - input image size (height, width)
    """
    return (75, 75) if str(name).lower() == str(CnnName.INCEPTIONV3.value).lower() else (32, 32)


def get_training_params(name):
    """
    Get training parameters by CNN's name

    :param name: model name ('VGG19', 'ResNeXt50', 'ResNet50', 'InceptionV3' or 'Custom')
    :return:
       * img_size - input image size (height, width)
       * lr - learning rate
    """
    if name == CnnName.INCEPTIONV3.value:
        img_size = (75, 75)
        lr = 0.00007
    else:
        img_size = (32, 32)
        lr = 0.001 if name == CnnName.CUSTOM.value else 0.0001

    return img_size, lr
