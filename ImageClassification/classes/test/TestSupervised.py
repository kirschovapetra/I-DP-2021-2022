from classes.cnn.SupervisedModel import SupervisedModel
from classes.utils.Constants import LABELS_PRIMARY, TRAIN_ARGS_DEFAULT
from classes.utils.Datasets import Datasets
from classes.utils.Utils import Utils
from general import *


class TestSupervised:
    """ Methods for supervised model's testing """

    @staticmethod
    def _run_model(name: str, weights_dir: str, filename: str, batch_size: int, epochs: int, checkpoint: int = None, dataset: str = None,
                   classes: list = None, train_iter: DataFrameIterator = None, test_iter: DataFrameIterator = None,
                   val_iter: DataFrameIterator = None, reload: bool = False) -> Tuple[float, SupervisedModel, dict]:
        """
        Run CNN model

        :param name: model name ('VGG19', 'ResNeXt50', 'ResNet50', 'InceptionV3' or 'Custom')
        :param weights_dir: base directory for trained model weights
        :param filename: filename for trained model weights
        :param batch_size: batch size
        :param epochs: number of epochs
        :param checkpoint: number of epoch from which to run callback
        :param dataset: name of dataset
        :param classes: list of clases
        :param train_iter: training iterator
        :param test_iter: testing iterator
        :param val_iter: validation iterator
        :param reload: reload from file
        :return:
            * acc: model's accuracy
            * model: cnn model's wrapper (SupervisedModel)
            * model.history: training history
        """

        model = Utils.init_model(name=name, weights_dir=weights_dir, dirname=filename, filename=filename, batch_size=batch_size, epochs=epochs,
                                 out_shape=len(classes), checkpoint=checkpoint, dataset=dataset)
        if reload:
            model.reload()
        else:
            model.train(train_iter, val_iter)

        acc = model.evaluate(test_iter)

        return acc, model, model.history

    @staticmethod
    def _run_cnn(dataset: str, name: str, epochs: int, batch_size: int, checkpoint: int = 50, reload: bool = False,
                 save_sample: bool = False, train_gen_args: dict = TRAIN_ARGS_DEFAULT, weights_dir: str = None, ):
        """
        Run CNN - core function

        :param dataset: name of dataset
        :param name: Name of weak classifier
        :param epochs: number of epochs
        :param batch_size: batch size
        :param checkpoint: number of epoch from which to run callback
        :param reload: reload from file
        :param save_sample: save sample of images
        :param train_gen_args: image augmentation parameters
        :param weights_dir: base directory for trained model weights
        :return:
        :return:
            * accuracy : model's accuracy
            * model : model wrapper (SupervisedModel)
        """

        img_size, lr = Utils.get_training_params(name)

        # init
        if weights_dir is None:
            weights_dir = 'weights/cnn'
        weights_dir = os.path.join(weights_dir, dataset)
        filename = Utils.init(weights_dir, name, epochs, train_gen_args)

        # load data
        train_iter, test_iter, val_iter = Datasets.load_dataset_iter(dataset, 0.7, img_size, batch_size, train_gen_args, reload, save_sample)

        args = {
            'name': name, 'weights_dir': weights_dir, 'filename': filename, 'batch_size': batch_size, 'epochs': epochs, 'checkpoint': checkpoint, 'dataset': dataset,
            'classes': LABELS_PRIMARY, 'train_iter': train_iter, 'test_iter': test_iter, 'val_iter': val_iter, 'reload': reload
        }
        #  run model
        accuracy, model, _ = TestSupervised._run_model(**args)

        return accuracy, model

    @staticmethod
    def run_custom_iter(train_iter, test_iter, val_iter, dataset: str, name: str, epochs: int, batch_size: int, checkpoint: int = 50,
                        reload: bool = False, train_gen_args: dict = TRAIN_ARGS_DEFAULT, weights_dir: str = None, ):
        """
        :param train_iter: train dataframe iterator
        :param test_iter: test dataframe iterator
        :param val_iter: validation dataframe iterator
        :param dataset: name of dataset
        :param name: Name of weak classifier
        :param epochs: number of epochs
        :param batch_size: batch size
        :param checkpoint: number of epoch from which to run callback
        :param reload: reload from file
        :param train_gen_args: image augmentation parameters
        :param weights_dir: base directory for trained model weights

        :return:
            * accuracy : model's accuracy
            * model : model wrapper (SupervisedModel)
        """
        # init
        if weights_dir is None:
            weights_dir = 'weights/cnn'
        weights_dir = os.path.join(weights_dir, dataset)
        filename = Utils.init(weights_dir, name, epochs, train_gen_args)

        args = {
            'name': name, 'weights_dir': weights_dir, 'filename': filename, 'batch_size': batch_size, 'epochs': epochs, 'checkpoint': checkpoint, 'dataset': dataset,
            'classes': LABELS_PRIMARY, 'train_iter': train_iter, 'test_iter': test_iter, 'val_iter': val_iter, 'reload': reload
        }
        accuracy, model, _ = TestSupervised._run_model(**args)

        return accuracy, model

    @staticmethod
    def run(name: str, dataset: str, batch_size: int = 100, epochs: int = 20, checkpoint: int = 50, reload: bool = False,
            save_sample: bool = False, train_gen_args: dict = TRAIN_ARGS_DEFAULT):
        """
        Run CNN supervised model

        :param dataset: name of dataset
        :param name: Name of weak classifier
        :param epochs: number of epochs
        :param batch_size: batch size
        :param checkpoint: number of epoch from which to run callback
        :param reload: reload from file
        :param save_sample: save sample of images
        :param train_gen_args: image augmentation parameters
        :return:
            * accuracy - model's accuracy
            * model - model wrapper (SupervisedModel)
        """
        print(f"--- Dataset: {dataset}\n--- Name: {name}")
        accuracy, model = TestSupervised._run_cnn(dataset=dataset, name=name, epochs=epochs, batch_size=batch_size, checkpoint=checkpoint,
                                                  reload=reload, save_sample=save_sample, train_gen_args=train_gen_args)
        return accuracy, model

    @staticmethod
    def run_all(names: list, dataset: str, batch_size: int = 100, epochs: int = 20, checkpoint: int = 50, reload: bool = False,
                save_sample: bool = False, train_gen_args: dict = TRAIN_ARGS_DEFAULT):
        """
        Run all CNN supervised model specified by names list

        :param names: Name of weak classifier
        :param dataset: name of dataset
        :param batch_size: batch size
        :param epochs: number of epochs
        :param checkpoint: number of epoch from which to run callback
        :param reload: reload from file
        :param save_sample: save sample of images
        :param train_gen_args: image augmentation parameters
        :return:
            * accuracy - model's accuracy
            * model - model wrapper (SupervisedModel)
        """
        acc_dict = {}
        for name in names:
            print(f"--- Dataset: {dataset}\n--- Name: {name}")
            accuracy, _ = TestSupervised._run_cnn(dataset=dataset, name=name, epochs=epochs, batch_size=batch_size, checkpoint=checkpoint,
                                                  reload=reload, save_sample=save_sample, train_gen_args=train_gen_args)
            acc_dict[name] = accuracy

        return acc_dict, names
