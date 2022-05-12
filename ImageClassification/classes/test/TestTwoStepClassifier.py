from classes.cnn.BaseModel import PrimaryModel
from classes.test.TestEnsemble import TestEnsemble
from classes.test.TestSupervised import TestSupervised
from classes.two_step.TwoStepClassifier import TwoStepClassifier
from classes.utils.Constants import Dataset, TRAIN_ARGS_DEFAULT


class TestTwoStepClassifier:
    """ Methods for 2-step classifier's testing """

    @staticmethod
    def run_2step_cnn(name_primary: str, name_secondary: str, batch_size: int = 70, epochs_primary: int = 20, epochs_secondary: int = 20,
                      checkpoint: int = 50, train_gen_args: dict = TRAIN_ARGS_DEFAULT, reload_primary: bool = False, reload_secondary: bool = False):
        """
        Test 2-step classifier with CNN primary model
        :param name_primary: primary model name
        :param name_secondary: secondary model name
        :param batch_size: batch size
        :param epochs_primary: number of epochs for primary model
        :param epochs_secondary: number of epochs for secondary model
        :param checkpoint: number of epoch from which to run callback
        :param train_gen_args: image augmentation parameters
        :param reload_primary: reload primary model from file
        :param reload_secondary: reload secondary model from file
        :return:
            * acc_cnn : primary model's accuracy
            * sec_acc : secondary model's average accuracy
            * two_step_acc : two-step model's accuracy
        """
        # primary
        prim_acc, model_prim_cnn = TestSupervised.run(dataset=Dataset.VEGA_PRIMARY.value, name=name_primary, epochs=epochs_primary,
                                                      batch_size=batch_size, checkpoint=checkpoint, reload=reload_primary, train_gen_args=train_gen_args)
        # two-step
        sec_acc, two_step_acc = TestTwoStepClassifier._run_2step_core(model_prim_cnn, name_secondary, batch_size,
                                                                      epochs_secondary, checkpoint, reload_secondary)
        return prim_acc, sec_acc, two_step_acc

    @staticmethod
    def run_2step_bagging(name_primary: str, name_secondary: str, batch_size: int = 70, n_est: int = 2, epochs_primary: int = 20,
                          epochs_secondary: int = 20, checkpoint: int = 50, train_gen_args: dict = TRAIN_ARGS_DEFAULT,
                          reload_primary: bool = False, reload_secondary: bool = False):
        """
        Test 2-step classifier with bagging primary model
        :param name_primary: primary model name
        :param name_secondary: secondary model name
        :param batch_size: batch size
        :param n_est: number of estimators
        :param epochs_primary: number of epochs for primary model
        :param epochs_secondary: number of epochs for secondary model
        :param checkpoint: number of epoch from which to run callback
        :param train_gen_args: image augmentation parameters
        :param reload_primary: reload primary model from file
        :param reload_secondary: reload secondary model from file
        :return:
           * acc_cnn : primary model's accuracy
           * sec_acc : secondary model's average accuracy
           * two_step_acc : two-step model's accuracy
        """
        # primary
        prim_acc, model_prim_bag = TestEnsemble.run_bagging(name=name_primary, n_estimators=n_est, epochs=epochs_primary, batch_size=batch_size,
                                                            dataset=Dataset.VEGA_PRIMARY.value, reload=reload_primary, train_gen_args=train_gen_args)
        # two-step
        sec_acc, two_step_acc = TestTwoStepClassifier._run_2step_core(model_prim_bag, name_secondary, batch_size,
                                                                      epochs_secondary, checkpoint, reload_secondary)
        return prim_acc, sec_acc, two_step_acc

    @staticmethod
    def run_2step_boosting(name_primary: str, name_secondary: str, batch_size: int = 70, epochs_primary: int = 20, epochs_xgb: int = 50,
                           epochs_secondary: int = 20, checkpoint: int = 50, train_gen_args: dict = TRAIN_ARGS_DEFAULT,
                           reload_primary: bool = False, reload_secondary: bool = False):
        """
        Test 2-step classifier with bagging primary model
        :param name_primary: primary model name
        :param name_secondary: secondary model name
        :param batch_size: batch size
        :param epochs_primary: number of epochs for cnn-primary model
        :param epochs_xgb: number of epochs for xgb-primary model
        :param epochs_secondary: number of epochs for secondary model
        :param checkpoint: number of epoch from which to run callback
        :param train_gen_args: image augmentation parameters
        :param reload_primary: reload primary model from file
        :param reload_secondary: reload secondary model from file
        :return:
           * acc_cnn : primary model's accuracy
           * sec_acc : secondary model's average accuracy
           * two_step_acc : two-step model's accuracy
        """

        # primary
        prim_acc, model_prim_boost = TestEnsemble.run_boosting(dataset=Dataset.VEGA_PRIMARY.value, name=name_primary, epochs_cnn=epochs_primary,
                                                               epochs_xgboost=epochs_xgb, batch_size=batch_size, reload=reload_primary, train_gen_args=train_gen_args)
        # two-step
        sec_acc, two_step_acc = TestTwoStepClassifier._run_2step_core(model_prim_boost, name_secondary, batch_size,
                                                                      epochs_secondary, checkpoint, reload_secondary)
        return prim_acc, sec_acc, two_step_acc

    @staticmethod
    def run_2step_stacking(names: list, n_folds: int, name_secondary: str, batch_size: int = 70, epochs_primary: int = 20, epochs_secondary: int = 20,
                           checkpoint: int = 50, train_gen_args: dict = TRAIN_ARGS_DEFAULT, reload_primary: bool = False, reload_secondary: bool = False):
        """
        Test 2-step classifier with bagging primary model
        :param names: weak classifier names for primary model
        :param n_folds: number of folds
        :param name_secondary: secondary model name
        :param batch_size: batch size
        :param epochs_primary: number of epochs for primary model
        :param epochs_secondary: number of epochs for secondary model
        :param checkpoint: number of epoch from which to run callback
        :param train_gen_args: image augmentation parameters
        :param reload_primary: reload primary model from file
        :param reload_secondary: reload secondary model from file
        :return:
           * acc_cnn : primary model's accuracy
           * sec_acc : secondary model's average accuracy
           * two_step_acc : two-step model's accuracy
        """

        # primary
        prim_acc, model_prim_stack = TestEnsemble.run_stacking(names=names, n_folds=n_folds, epochs=epochs_primary, batch_size=batch_size,
                                                               dataset=Dataset.VEGA_PRIMARY.value, reload=reload_primary, train_gen_args=train_gen_args)
        # two-step
        sec_acc, two_step_acc = TestTwoStepClassifier._run_2step_core(model_prim_stack, name_secondary, batch_size,
                                                                      epochs_secondary, checkpoint, reload_secondary)
        return prim_acc, sec_acc, two_step_acc

    @staticmethod
    def _run_2step_core(model_prim: PrimaryModel, name_secondary: str, batch_size: int = 70, epochs_secondary: int = 20,
                        checkpoint: int = 50, reload_secondary: bool = False):
        """
        :param model_prim: primary model wrapper instance
        :param name_secondary: secondary model name
        :param batch_size: batch size
        :param epochs_secondary: number of epochs for secondary model
        :param checkpoint: number of epoch from which to run callback
        :param reload_secondary: reload secondary model from file
        :return:
            * sec_acc : secondary model's average accuracy
           * two_step_acc : two-step model's accuracy
        """
        two_step_model = TwoStepClassifier(model_primary=model_prim, name_secondary=name_secondary,
                                           batch_size=batch_size, epochs_secondary=epochs_secondary, checkpoint=checkpoint)
        if not reload_secondary:
            two_step_model.model_secondary.train()

        sec_acc, two_step_acc = two_step_model.evaluate()

        return sec_acc, two_step_acc
