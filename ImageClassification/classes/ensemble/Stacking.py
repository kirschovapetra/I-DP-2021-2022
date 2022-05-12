import pickle
from operator import itemgetter
from statistics import mean
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import StratifiedKFold

from classes.ensemble.EnsembleModel import EnsembleModel
from classes.utils.Constants import TRAIN_ARGS_DEFAULT
from classes.utils.Datasets import Datasets
from classes.utils.Graphs import Graphs
from classes.utils.Utils import Utils
from general import *


class Stacking(EnsembleModel):
    """
    Stacking ensemble model

    1. Split the data into a training and validation set,
    2. Divide the training set into K folds, for example 10,
    3. Train a base model (say SVM) on 9 folds and make predictions on the 10th fold,
    4. Repeat until you have a prediction for each fold,
    5. Fit the base model on the whole training set,
    6. Use the model to make predictions on the test set,
    7. Repeat step 3 – 6 for other base models (for example decision trees),
    8. Use predictions from the test set as features to a new model – the meta-model,
    9. Make final predictions on the test set using the meta-model.

    Sources:
    * https://machinelearningmastery.com/stacking-ensemble-for-deep-learning-neural-networks/
    * https://neptune.ai/blog/ensemble-learning-guide

    Attributes

    ----------

    names : name(s) of weak classifiers
    train_size : size of training set
    n_folds : number of folds training data will be split into
    epochs : number of epochs
    batch_size : batch size
    checkpoint : number of epoch from which to run callback
    base_names : filename of each weak classifier
    base_predictions : predictions of each weak classifier
    final_classifier : cnn model for final meta-lassifier
    histories : training history for each classifier and fold dict{filename: history}
    names : names of weak classifiers architectures
    """

    n_folds: int = 3
    base_names: list = []
    final_classifier: any = None
    base_predictions: dict = {}
    base_labels: list = []
    histories: dict = {}
    names: list = []
    train_size: float = 0.7
    train_gen_args: dict = TRAIN_ARGS_DEFAULT

    def __init__(self, names: list, train_size: float, n_folds: int, epochs: int,
                 batch_size: int, dataset: str, checkpoint: int, train_gen_args: dict = TRAIN_ARGS_DEFAULT) -> None:

        img_sizes = []
        for name in names:
            img_size, _ = Utils.get_training_params(name)
            img_sizes.append(img_size)

        if not all(x == img_sizes[0] for x in img_sizes):
            max_size = max(img_sizes, key=itemgetter(1))[0]
            img_sizes = [(max_size, max_size) for i in range(len(names))]

        dirname = f"{'_'.join(map(str, names))}_{epochs}-ep_{n_folds}-folds"

        self.n_folds = n_folds
        self.train_gen_args = train_gen_args
        self.names = names
        self.base_names = []
        self.base_labels = []
        self.base_predictions = {}
        self.final_classifier = None
        train_df, test_df, weights_path = Datasets.load_ensemble_df(dataset, train_size, self.weights_dir, 'stacking/')

        super().__init__(weights_path, dirname, train_df, test_df, epochs, batch_size, img_sizes[0], checkpoint, dataset)

    def reload(self, *args):
        """ Reload stacking models and histories from files """
        self.base_names = []
        self.base_labels = []

        # iterate over each weak classifier and fold
        for i, name in enumerate(self.names):
            for fold_id in range(self.n_folds):
                filename = f"{self.dirname}_estId-{name}_{i}_foldId-{fold_id}"
                # load model and history from file
                self.base_names.append(filename)
                self.histories[filename] = self._reload_hist(self.weights_dir, self.dirname, filename)

        final_classif_filename = os.path.join(self.weights_dir, self.dirname, f'{self.dirname}_final.h5')
        self.final_classifier = pickle.load(open(final_classif_filename, 'rb'))

    def train(self, *args):
        """ Train ensemble - stacking model """
        # clear weights folder
        Utils.clear_dir(os.path.join(self.weights_dir, self.dirname + '/*'))
        self._train_weak_classifiers()
        self._train_meta_model()

    def _train_weak_classifiers(self):
        train_data = self.train_df["filename"]
        labels = self.train_df["class"]
        self.base_names = []
        self.base_labels = []
        self.base_predictions = {}

        # split training data to multiple folds
        fold_id = 0
        kfold = StratifiedKFold(self.n_folds).split(train_data, labels)
        for train_idx, test_idx in kfold:
            ''' get training, testing and validation data '''

            # train data
            base_train_df = self.train_df.iloc[train_idx]
            # test data - to create predictions
            base_test_df = self.train_df.iloc[test_idx]
            # val data - to evaluate model during training (split from train data)
            base_train_df, base_val_df = model_selection.train_test_split(   # val.data (20%)
                base_train_df, train_size=0.8, shuffle=True, random_state=123)

            train_iter, test_iter, val_iter = Datasets.get_iterators_from_df(img_size=self.img_size, batch_size=self.batch_size,
                                                                             train_gen_args=self.train_gen_args,
                                                                             train_df=base_train_df, test_df=base_test_df, val_df=base_val_df)
            self.base_labels.extend(test_iter.labels)

            for classifier_id, classifier in enumerate(self.names):
                '''train weak classifier'''
                filename = f"{self.dirname}_estId-{classifier}_{classifier_id}_foldId-{fold_id}"
                # get cnn model of a weak classifier
                model_wrapper = Utils.init_model(name=classifier, img_size=self.img_size,
                                                 weights_dir=self.weights_dir, dirname=self.dirname, filename=filename,
                                                 batch_size=self.batch_size, epochs=self.epochs,
                                                 out_shape=len(train_iter.class_indices), dataset=self.dataset, checkpoint=self.checkpoint)
                # train
                model_wrapper.train(train_iter, val_iter)
                # save trained model's name and history
                self.base_names.append(filename)
                self.histories[filename] = model_wrapper.history

                # get predictions for meta-model's dataset
                y_pred = model_wrapper.model.predict(test_iter, verbose=0, batch_size=self.batch_size)

                model_pred_name = filename.split('_foldId')[0]
                if model_pred_name not in self.base_predictions.keys():
                    self.base_predictions[model_pred_name] = []
                self.base_predictions[model_pred_name].extend(y_pred)

                # clear cached models
                Utils.reset_keras(model_wrapper.model)
                Utils.reset_keras(model_wrapper)

            fold_id += 1

    def _train_meta_model(self):

        stackX = self.create_stacked_dataset(self.base_predictions)
        # fit stacked probabilities
        self.final_classifier = LogisticRegression()
        self.final_classifier.fit(stackX, self.base_labels)

        final_classif_filename = os.path.join(self.weights_dir, self.dirname, f'{self.dirname}_final.h5')
        pickle.dump(self.final_classifier, open(final_classif_filename, 'wb'))

    def evaluate(self, plot=True, *args):
        """
        Evaluate stacking model's accurracy

        :param plot: plot graphs
        :return:
            * stacking_acc: stacking model's accuracy on test set
        """

        logger.log_eval_start(f"Stacking - {self.dataset}: {self.dirname}")

        # generate test data
        _, test_iter, _ = Datasets.get_iterators_from_df(img_size=self.img_size, batch_size=self.batch_size, test_df=self.test_df)
        test_y = np.array(test_iter.labels)
        class_names = list(test_iter.class_indices.keys())

        # evaluate each weak classifier
        preds, accs = self._predict(test_iter, test_iter.labels)
        # predict with stacked model
        stackX = self.create_stacked_dataset(preds)
        final_y_pred = self.final_classifier.predict(stackX)

        # calculate stacked model's accurracy
        stacking_acc = metrics.accuracy_score(test_y, final_y_pred) * 100

        if plot:
            Graphs.plot_ensemble_history(self.histories, f"tmp/charts/{self.dirname}_stacking.png")
            Graphs.plot_classification_results(classes=class_names, test_y=test_y, pred_y=final_y_pred, title="STACKING: " + self.dirname)

        logger.log_eval_end([f'Stacking - {self.dataset}: {x}' for x in list(accs.keys())] +
                            [f"Stacking - {self.dataset}: {os.path.join(self.weights_dir, self.dirname)}"], list(accs.values()) + [stacking_acc])
        return stacking_acc

    def _predict(self, data: Union[DataFrameIterator, np.ndarray], get_eval_accs: bool = True, verbose: int = 0):
        pred_dict: dict = {}
        acc_dict: dict = {}
        for model_name in self.base_names:

            base_model = self._reload_model(self.weights_dir, self.dirname, model_name)
            model_pred_name = model_name.split('_foldId')[0]
            base_y_pred = base_model.predict(data, verbose=verbose, batch_size=self.batch_size)
            Utils.reset_keras(base_model)

            if get_eval_accs:
                try:
                    if model_pred_name not in acc_dict:
                        acc_dict[model_pred_name] = []

                    acc = metrics.accuracy_score(np.argmax(base_y_pred, axis=1), data.labels) * 100
                    acc_dict[model_pred_name].append(acc)
                    # data.reset()
                except Exception as e:
                    print(str(e))

            if model_pred_name not in pred_dict:
                pred_dict[model_pred_name] = []
            pred_dict[model_pred_name].append(base_y_pred)

        for mdl_name in pred_dict.keys():
            if get_eval_accs:
                acc_dict[mdl_name] = mean(acc_dict[mdl_name])
            pred_nparray = np.array([x for x in pred_dict[mdl_name]])
            pred_dict[mdl_name] = np.mean(pred_nparray, axis=0)

        return pred_dict, acc_dict

    @staticmethod
    def create_stacked_dataset(pred_dict: dict):
        """
        Create stacked dataset for meta-model training and evaluation

        :param pred_dict: dictionary with predictions dict{filename:prediction}
        :return:
            * stackX - stacked meta-model dataset
        """

        stackX = None
        for model_name, preds in pred_dict.items():
            stackX = preds if stackX is None else np.dstack((stackX, preds))

        # flatten predictions to [rows, members x probabilities]
        stackX = stackX.reshape(
            (stackX.shape[0], stackX.shape[1] * stackX.shape[2])
        )
        return stackX

    def predict_single(self, filename: str, verbose: int = 0) -> list:
        """
        Predict class for single image

        :param filename: image file name
        :param verbose: show (1) or hide (0) log
        :return:
            * predicted: probabilities of predicted classes
        """

        np_image = self.load_img_to_numpy(filename, self.img_size)

        self.reload()
        preds, _ = self._predict(np_image, get_eval_accs=False, verbose=verbose)
        stackX = self.create_stacked_dataset(preds)
        predicted = self.final_classifier.predict_proba(stackX)

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

        self.reload()
        preds, _ = self._predict(np.vstack(img_list), get_eval_accs=False, verbose=verbose)
        stackX = self.create_stacked_dataset(preds)
        predicted = self.final_classifier.predict_proba(stackX)

        return predicted
