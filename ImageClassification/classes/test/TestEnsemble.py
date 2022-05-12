from classes.ensemble.Bagging import Bagging
from classes.ensemble.Boosting import Boosting
from classes.ensemble.EnsembleModel import EnsembleModel
from classes.ensemble.Stacking import Stacking
from classes.utils.Constants import Dataset, TRAIN_ARGS_DEFAULT
from classes.utils.Utils import Utils


class TestEnsemble:
    """ Methods for ensemble model's testing """

    @staticmethod
    def run_stacking(names: str = None, n_folds: int = 2, epochs: int = 10, batch_size: int = 50,
                     checkpoint: int = None, dataset: str = Dataset.VEGA_PRIMARY.value, reload: bool = False, train_gen_args: dict = TRAIN_ARGS_DEFAULT):
        """
        Run stacking classifier

        :param names: Names of weak classifiers
        :param n_folds: number of folds
        :param epochs: number of epochs
        :param batch_size: batch size
        :param checkpoint: number of epoch from which to run callback
        :param dataset: name of dataset
        :param reload: reload from file
        :param train_gen_args: image augmentation parameters
        :return
            * acc : model accuracy
            * model : loaded/trained model
        """

        model = Stacking(names=names, train_size=0.7, n_folds=n_folds,
                         epochs=epochs, batch_size=batch_size, dataset=dataset, train_gen_args=train_gen_args, checkpoint=checkpoint)
        return TestEnsemble._run(model, reload)

    @staticmethod
    def run_bagging(name: str = None, n_estimators: int = 3, epochs: int = 10, batch_size: int = 50, checkpoint=None,
                    dataset: str = Dataset.VEGA_PRIMARY.value, reload: bool = False, train_gen_args: dict = TRAIN_ARGS_DEFAULT):
        """
        Run bagging classifier

        :param name: Name of weak classifier
        :param n_estimators: number of estimators
        :param epochs: number of epochs
        :param batch_size: batch size
        :param checkpoint: number of epoch from which to run callback
        :param dataset: name of dataset
        :param reload: reload from file
        :param train_gen_args: image augmentation parameters
        :return
            * acc : model accuracy
            * model : loaded/trained model
        """
        model = Bagging(name=name, train_size=0.7, n_estimators=n_estimators, epochs=epochs,
                        batch_size=batch_size, dataset=dataset, train_gen_args=train_gen_args, checkpoint=checkpoint)
        return TestEnsemble._run(model, reload)

    @staticmethod
    def run_boosting(name: str = None, epochs_cnn: int = 10, epochs_xgboost: int = 10, batch_size: int = 50, checkpoint: int = None,
                     dataset: str = Dataset.VEGA_PRIMARY.value, reload: bool = False, train_gen_args: dict = TRAIN_ARGS_DEFAULT):
        """
        Run boosting classifier

        :param name: Name of weak classifier
        :param epochs_cnn: number of baseline cnn model's epochs
        :param epochs_xgboost: number of xgb model's epochs
        :param batch_size: batch size
        :param checkpoint: number of epoch from which to run callback
        :param dataset: name of dataset
        :param reload: reload from file
        :param train_gen_args: image augmentation parameters
        :return
            * acc : model accuracy
            * model : loaded/trained model
        """
        model = Boosting(name=name, train_size=0.7, epochs_cnn=epochs_cnn, num_boost_round=epochs_xgboost,
                         batch_size=batch_size, dataset=dataset, train_gen_args=train_gen_args, checkpoint=checkpoint)
        return TestEnsemble._run(model, reload)

    @staticmethod
    def _run(model: EnsembleModel, reload: bool):
        """
        Run - core function

        :param model: ensemble model's wrapper
        :param reload: reload from file
        :return
            * acc : model accuracy
            * model : loaded/trained model
        """

        if reload:
            model.reload()
        else:
            model.train()

        acc = model.evaluate(plot=False)

        if hasattr(model, 'model_cnn'):
            Utils.reset_keras(model.model_cnn)
            del model.model_cnn
        if hasattr(model, 'model_xgb'):
            Utils.reset_keras(model.model_xgb)
            del model.model_xgb

        return acc, model
