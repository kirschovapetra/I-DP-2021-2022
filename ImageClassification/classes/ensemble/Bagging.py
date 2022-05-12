from sklearn.utils import resample

from classes.ensemble.EnsembleModel import EnsembleModel
from classes.utils.Constants import TRAIN_ARGS_DEFAULT
from classes.utils.Datasets import Datasets
from classes.utils.Graphs import Graphs
from classes.utils.Utils import Utils
from general import *


class Bagging(EnsembleModel):
    """
    Bagging ensemble model

    1. Multiple subsets are created from the original data set with equal tuples, selecting observations with replacement.
    2. A base model is created on each of these subsets.
    3. Each model is learned in parallel from each training set and independent of each other.
    4. The final predictions are determined by combining the predictions from all the models - voting/averaging

    Source: https://machinelearningmastery.com/how-to-create-a-random-split-cross-validation-and-bagging-ensemble-for-deep-learning-in-keras/

    Attributes

    ----------

    * name : name of a weak classifier
    * train_size : size of training set
    * base_names : filenames of weak classifiers
    * n_estimators : number of weak classifiers the ensemble model consists of
    * epochs : number of epochs
    * batch_size : batch size
    * dataset: dataset name
    * checkpoint : number of epoch from which to run callback
    * train_gen_args: training ImagaDataGenerator arguments
    """

    name: str = ''
    train_size: float = 0.7
    n_estimators: int = 3
    base_names: list = []
    train_gen_args: dict = TRAIN_ARGS_DEFAULT

    def __init__(self, name: str, train_size: float, n_estimators: int, epochs: int, batch_size: int,
                 dataset: str, checkpoint: int, train_gen_args: dict = TRAIN_ARGS_DEFAULT) -> None:

        dirname = f"{name}_{epochs}-ep_{n_estimators}-est"
        img_size, lr = Utils.get_training_params(name)
        self.n_estimators = n_estimators
        self.name = name
        self.train_gen_args = train_gen_args
        self.dataset = dataset
        self.train_size = train_size
        self.base_names = []
        train_df, test_df, weights_path = Datasets.load_ensemble_df(dataset, train_size, self.weights_dir, 'bagging')
        super().__init__(weights_path, dirname, train_df, test_df, epochs, batch_size, img_size, checkpoint, dataset)

    def reload(self, *args):
        """ Reload bagging models and histories from files """
        self.base_names = []
        # iterate over each weak classifier
        for i in range(self.n_estimators):
            filename = f"{self.dirname}_estId-{self.name}_{i}"
            # load model and history from file
            self.histories[filename] = self._reload_hist(self.weights_dir, self.dirname, filename)
            self.base_names.append(filename)

    def train(self, *args):
        """ Train ensemble - bagging model """

        # clear weights folder
        Utils.clear_dir(os.path.join(self.weights_dir, self.dirname + '/*'))

        n = len(self.train_df)
        n_train_samples = int(n * 0.8)
        idx_all = list(range(n))
        self.base_names = []
        for i in range(self.n_estimators):
            # create bootstrap samples with replacement
            train_idx = resample(idx_all, replace=True, n_samples=n_train_samples)
            train_df_sample = self.train_df.iloc[train_idx]

            val_idx = [idx for idx in idx_all if idx not in train_idx]
            val_df_sample = self.train_df.iloc[val_idx]

            # get training and validation data
            train_iter, _, val_iter = Datasets.get_iterators_from_df(img_size=self.img_size, batch_size=self.batch_size,
                                                                     train_gen_args=self.train_gen_args,
                                                                     train_df=train_df_sample, val_df=val_df_sample)

            filename = f"{self.dirname}_estId-{self.name}_{i}"

            # get cnn model of a weak classifier
            model_wrapper = Utils.init_model(name=self.name,
                                             weights_dir=self.weights_dir, dirname=self.dirname, filename=filename,
                                             batch_size=self.batch_size, epochs=self.epochs, out_shape=len(train_iter.class_indices),
                                             dataset=self.dataset, checkpoint=self.checkpoint)
            # train cnn model
            model_wrapper.train(train_iter, val_iter)

            # save trained model and history
            self.base_names.append(filename)
            self.histories[filename] = model_wrapper.history

    def evaluate(self, plot: bool = True, *args):
        """
        Evaluate bagging model's accurracy
        :param plot: plot graphs
        :return:
            * bagging_acc: bagging model's accuracy on test set
        """
        logger.log_eval_start(f'Bagging - {self.dataset}: {self.dirname}')

        # generate test data
        _, test_iter, _ = Datasets.get_iterators_from_df(img_size=self.img_size, batch_size=self.batch_size, test_df=self.test_df)
        test_y = np.array(test_iter.labels)
        class_names = list(test_iter.class_indices.keys())

        # evaluate and predict with bagging model
        pred_y_final, accs = self._predict(test_iter)
        if plot:
            Graphs.plot_classification_results(classes=class_names, test_y=test_y, pred_y=pred_y_final, title="BAGGING: " + self.dirname)
            Graphs.plot_ensemble_history(self.histories, f"tmp/charts/{self.dirname}_bagging_chart.png")

        # calculate bagging model's accurracy
        bagging_acc = metrics.accuracy_score(test_y, pred_y_final) * 100
        logger.log_eval_end([f'Bagging - {self.dataset}: {x}' for x in self.base_names] + [f'Bagging - {self.dataset}: {self.dirname}'],
                            accs + [bagging_acc])

        return bagging_acc

    def _predict(self, test_iter: DataFrameIterator):
        """
        Predict labels on test set via soft voting

        :param test_iter: test dataframe iterator
        :return:
            * pred_results: numpy array of predicted classes
            * accs: list of weak models' accuracies
        """

        accs = []
        predictions = []
        for model_name in self.base_names:
            base_model = self._reload_model(self.weights_dir, self.dirname, model_name)
            base_y_pred = base_model.predict(test_iter, verbose=0, batch_size=self.batch_size)
            Utils.reset_keras(base_model)
            predictions.append(base_y_pred)
            accs.append(metrics.accuracy_score(np.argmax(base_y_pred, axis=1), test_iter.labels) * 100)

        # sum across ensemble members
        summed = np.sum(np.array(predictions), axis=0)
        # argmax across classes
        pred_results = np.argmax(summed, axis=1)
        return pred_results, accs

    def predict_single(self, filename: str, verbose: int = 0) -> list:
        """
        Predict class for single image

        :param filename: image file name
        :param verbose: show (1) or hide (0) log
        :return:
            * predicted: average probabilities of predicted classes
        """

        np_image = self.load_img_to_numpy(filename, self.img_size)

        predictions = []
        self.reload()
        for model_name in self.base_names:
            model = self._reload_model(self.weights_dir, self.dirname, model_name)
            pred = model.predict(np_image, verbose=verbose)
            predictions.append(pred)

        # sum across ensemble members
        summed = np.sum(np.array(predictions), axis=0)

        predicted = summed / len(self.base_names)

        return predicted

    def predict_multiple(self, filenames: list, verbose: int = 0) -> list:
        """
        Predict class for multiple images

        :param filenames: list of image file names
        :param verbose: show (1) or hide (0) log
        :return:
            * predicted: average probabilities of predicted classes for all samples
        """

        img_list = []
        sleep(0.01)
        lst_loop = tqdm(filenames) if verbose == 1 else filenames
        for name in lst_loop:
            np_image = self.load_img_to_numpy(name, self.img_size)
            img_list.append(np_image)

        predictions = []
        self.reload()
        sleep(0.01)
        for model_name in self.base_names:
            model = self._reload_model(self.weights_dir, self.dirname, model_name)
            pred = model.predict(np.vstack(img_list), batch_size=self.batch_size, verbose=verbose)
            predictions.append(pred)

        # sum across ensemble members
        summed = np.sum(np.array(predictions), axis=0)
        predicted = summed / len(self.base_names)

        return predicted
