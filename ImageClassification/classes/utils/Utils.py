import gc

from keras.applications import resnet, inception_v3, vgg19
from keras.backend import clear_session
from keras.backend import get_session
from keras.backend import set_session
from keras_cv_attention_models import resnet_family
from skimage.filters import threshold_otsu

from classes.cnn.CustomModel import CustomModel
from classes.cnn.PretrainedModel import PretrainedModel
from classes.cnn.SupervisedModel import SupervisedModel
from classes.utils.Constants import Dataset, CnnName, TRAIN_ARGS_DEFAULT
from general import *


class Utils:
    """ Various helper methods """

    @staticmethod
    def validate_dataset(dataset: str):
        """
        Validate name of dataset

        :param dataset: dataset name
        :raise: Exception("Invalid dataset name")
        """
        if dataset not in [d.value for d in Dataset]:
            raise Exception(f"Invalid dataset name: '{dataset}'")

    @staticmethod
    def validate_cnn(name: str):
        """
        Validate name of CNN model

        :param name: model name
        :raise: Exception("Invalid CNN name")
        """

        if name not in [cnn.value for cnn in CnnName]:
            raise Exception("Invalid CNN name")

    @staticmethod
    def reset_keras(obj: any):
        """
        Clear keras model from memory
        Source: https://github.com/keras-team/keras/issues/12625

        :param obj: object to delete
        """

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

    @staticmethod
    def listdir_fullpath(d: str):
        """
        List directory with full paths
        :param d: root directory path
        :return: list of file paths
        """

        return [os.path.join(d, f) for f in os.listdir(d)]

    @staticmethod
    def init(weights_dir: str, name: str, epochs: int, train_gen_args: dict = TRAIN_ARGS_DEFAULT):
        """
        Initnialize weights directory and filename

        :param weights_dir: base directory for trained model weights
        :param name: model name ('VGG19', 'ResNeXt50', 'ResNet50', 'InceptionV3' or 'Custom')
        :param epochs: number of epochs
        :param train_gen_args: image augmentation parameters
        :return:
            * filename - name of saved model's file
        """
        filename = name + '_' + str(epochs)

        if not os.path.exists(weights_dir):
            os.makedirs(weights_dir)

        if train_gen_args is not None:
            for key in train_gen_args.keys():
                filename += '-' + key

        return filename

    @staticmethod
    def get_training_params(name: str):
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

    @staticmethod
    def clear_dir(dir_path: str) -> bool:
        """
        Clear directory contents

        :param dir_path: root directory path
        :return: success/failure
        """

        try:
            for f in glob.glob(dir_path):
                os.remove(f)
            return True
        except Exception:
            return False

    @staticmethod
    def init_model(name: str, weights_dir: str, dirname: str, filename: str, batch_size: int, epochs: int, out_shape: int,
                   img_size: Tuple = None, checkpoint: int = None, dataset: str = None) -> SupervisedModel:
        """
        Initialize model

        :param name: model name ('VGG19', 'ResNeXt50', 'ResNet50', 'InceptionV3' or 'Custom')
        :param weights_dir: path to base weights' directory
        :param dirname: name of weights subdirectory
        :param filename: name of weights file
        :param img_size: image size
        :param batch_size: batch size
        :param epochs: number of epochs
        :param out_shape: output shape, number of output classes
        :param checkpoint: number of epoch from which to run callback
        :param dataset: name of dataset
        :return: CNN model's wrapper (SupervisedModel)
        """

        Utils.validate_cnn(name)
        img_size_tmp, lr = Utils.get_training_params(name)

        if img_size is None: img_size = img_size_tmp

        args = {
            'name': name, 'weights_dir': weights_dir, 'dirname': dirname, 'filename': filename, 'batch_size': batch_size,
            'epochs': epochs, 'lr': lr, 'img_size': img_size, 'out_shape': out_shape, 'checkpoint': checkpoint, 'dataset': dataset
        }

        if name == CnnName.CUSTOM.value:
            return CustomModel(**args)
        elif name == CnnName.RESNET50.value:
            base_model = resnet.ResNet50(include_top=False, input_shape=img_size + (3,), pooling='max', classes=out_shape)
        elif name == CnnName.RESNEXT50.value:
            base_model = resnet_family.ResNeXt50(input_shape=img_size + (3,))
        elif name == CnnName.INCEPTIONV3.value:
            base_model = inception_v3.InceptionV3(include_top=False, input_shape=img_size + (3,), pooling='max', classes=out_shape)
        elif name == CnnName.VGG19.value:
            base_model = vgg19.VGG19(include_top=False, input_shape=img_size + (3,), pooling='max', classes=out_shape)
        else:
            raise Exception("Invalid pre-trained model name")

        return PretrainedModel(base_model=base_model, **args)

    @staticmethod
    def to_otsu(img):
        """
        Convert image to otsu threshold
        :param img: image
        :return: image converted to otsu
        """

        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        thresh = threshold_otsu(gray)
        result = (gray > thresh).astype('float64')
        return cv2.merge([result, result, result]) * 255

    @staticmethod
    def denoise(img):
        """
        Denoise image
        :param img: image
        :return: denoised image
        """
        img_pil = Image.fromarray(img.astype(np.uint8))
        result = cv2.fastNlMeansDenoisingColored(np.asarray(img_pil), None, 10, 10, 7, 21)
        result_uint = np.uint8(result)
        return result_uint.astype('float64')
