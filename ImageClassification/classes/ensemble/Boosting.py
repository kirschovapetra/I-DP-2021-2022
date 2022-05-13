from itertools import chain

import xgboost as xgb
from keras import backend as be

from classes.ensemble.EnsembleModel import EnsembleModel
from classes.utils.Constants import TRAIN_ARGS_DEFAULT
from classes.utils.Datasets import Datasets
from classes.utils.Graphs import Graphs
from classes.utils.Utils import Utils
from general import *

FEAT_LAYER = "flatten"


class Boosting(EnsembleModel):
    """
    Boosting ensemble model

    Source: https://github.com/jonaac/deep-xgboost-image-classifier

    Attributes

    ----------

    * name : name of a weak classifier
    * train_size : size of training set
    * epochs_cnn : number of cnn's epochs
    * num_boost_round : number of boosting's epochs
    * batch_size : batch size
    * dataset: dataset name
    * checkpoint : number of epoch from which to run callback
    * train_gen_args: training ImagaDataGenerator arguments
    * model_cnn : baseline cnn classifier's model
    * model_cnn_wrapper : wrapper for CNN model (SupervisedModel object)
    * model_xgb : xgb boosting model
    * parameters_cnn : cnn training's parameters
    * train_iter : training iterator
    * test_iter : testing iterator
    * val_iter : validation iterator
    """

    num_boost_round: int = 20
    model_cnn = None
    model_cnn_wrapper = None
    model_xgb = None
    parameters_cnn: dict = None
    train_iter: DataFrameIterator = None
    test_iter: DataFrameIterator = None
    val_iter: DataFrameIterator = None
    train_size: float = 0.7
    train_gen_args: dict = TRAIN_ARGS_DEFAULT

    def __init__(self, name: str, train_size: float, epochs_cnn: int, num_boost_round: int, batch_size: int,
                 dataset: str, checkpoint: int, train_gen_args: dict = TRAIN_ARGS_DEFAULT) -> None:
        dirname = f"{name}_{epochs_cnn}-ep-cnn_{num_boost_round}-ep-xgb"
        img_size, lr = Utils.get_training_params(name)

        cnn_weights_dir = 'weights/cnn'
        cnn_weights_dir = os.path.join(cnn_weights_dir, dataset)
        dir_filename = Utils.init(cnn_weights_dir, name, epochs_cnn, train_gen_args)

        self.parameters_cnn = {"name": name, "lr": lr, 'epochs': epochs_cnn, 'weights_dir': cnn_weights_dir, 'dirname': dir_filename, 'filename': dir_filename}
        self.num_boost_round = num_boost_round
        self.train_size = train_size
        self.train_gen_args = train_gen_args
        self.dataset = dataset

        weights_path = os.path.join(self.weights_dir, self.dataset, 'boosting/')
        self.train_iter, self.test_iter, self.val_iter = Datasets.load_dataset_iter(dataset, train_size, img_size, batch_size, train_gen_args, False, False)

        self.model_cnn_wrapper = Utils.init_model(name=self.parameters_cnn['name'],
                                                  weights_dir=self.parameters_cnn['weights_dir'], dirname=self.parameters_cnn['dirname'],
                                                  filename=self.parameters_cnn['filename'], batch_size=self.batch_size, epochs=self.parameters_cnn['epochs'],
                                                  out_shape=len(self.train_iter.class_indices), dataset=self.dataset, checkpoint=self.checkpoint)

        super().__init__(weights_path, dirname, None, None, None, batch_size, img_size, checkpoint, dataset)

    def reload(self, verbose: int = 1, *args):
        """
        Reload boosting model and history from files

        :param verbose: show (1) or hide (0) log
        """

        self.model_cnn_wrapper.reload()
        self.model_cnn, self.histories['cnn'] = self.model_cnn_wrapper.model, self.model_cnn_wrapper.history

        filename_xgb = os.path.join(self.weights_dir, self.dirname, self.dirname + "_XGBOOST")
        self.model_xgb = xgb.Booster()
        self.model_xgb.load_model(filename_xgb + '.h5')
        if verbose == 1:
            print(f'Loaded model from {filename_xgb}.h5')
        with open(filename_xgb + '_history.json') as file:
            self.histories['xgb'] = json.load(file)

    def train(self, *args):
        """ Train ensemble - boosting model """

        # clear weights folder
        Utils.clear_dir(os.path.join(self.weights_dir, self.dirname + '/*'))

        # train models
        self.train_cnn()
        self.train_xgb()

    def train_cnn(self):
        """ Train baseline cnn classifier """

        mdl, hist, cl = self.model_cnn_wrapper.reload()

        if mdl is None:
            self.model_cnn_wrapper.train(self.train_iter, self.val_iter)
        self.model_cnn, self.histories['cnn'] = self.model_cnn_wrapper.model, self.model_cnn_wrapper.history

    def train_xgb(self):
        """ Train xgb boosting model """

        # convert to np arrays
        train_ds_numpy = Datasets.iterator_to_numpy(self.train_iter)
        train_y = np.argmax(np.array(list(chain(*train_ds_numpy[1]))), axis=1)

        val_ds_numpy = Datasets.iterator_to_numpy(self.val_iter)
        val_y = np.argmax(np.array(list(chain(*val_ds_numpy[1]))), axis=1)

        # extract features
        X_train_features = self.extract_from_layer(self.train_iter, self.batch_size, FEAT_LAYER)
        X_val_features = self.extract_from_layer(self.val_iter, self.batch_size, FEAT_LAYER)

        dtrain = xgb.DMatrix(X_train_features, label=train_y)
        dval = xgb.DMatrix(X_val_features, label=val_y)

        # training parameters
        params = {
            'max_depth': 11, 'eta': 0.25, 'gamma': 0.75, 'min_child_weight': 6.0, 'subsample': 0.8,
            'objective': 'multi:softprob', 'eval_metric': 'mlogloss', 'num_class': len(self.train_iter.class_indices),
        }

        filename = self.dirname + "_XGBOOST"

        # log start of training
        logger.log_training_start(f'{self.dataset}: {filename}')
        xgb_hist = {}

        self.model_xgb = xgb.train(params=params, dtrain=dtrain, num_boost_round=self.num_boost_round,
                                   evals=[(dtrain, 'train'), (dval, 'val')], evals_result=xgb_hist, verbose_eval=True,
                                   feval=lambda PRED_Y, DTRAIN: ('accuracy', float(be.mean(be.equal(DTRAIN.get_label(), be.argmax(PRED_Y, axis=-1))))))

        self.histories['xgb'] = xgb_hist
        # log end of training
        logger.log_training_end(f'{self.dataset}: {filename}',
                                self.histories['xgb']["train"]["mlogloss"][-1], self.histories['xgb']["train"]["accuracy"][-1],
                                self.histories['xgb']["val"]["mlogloss"][-1], self.histories['xgb']["val"]["accuracy"][-1])

        path = os.path.join(self.weights_dir, self.dirname)

        # save xgb model and history
        self.model_xgb.save_model(os.path.join(path, filename + ".h5"))
        with open(os.path.join(path, filename + '_history.json'), 'w') as file:
            json.dump(self.histories['xgb'], file)

    def evaluate(self, plot=True, *args):
        """
        Evaluate boosting model's accurracy

        :param plot: plot graphs
        :return:
            * xgb_acc: xgb model's accuracy on test set
        """

        filenames = [f'{self.dataset}: {self.parameters_cnn["dirname"]}', f'{self.dataset}: {self.dirname}_XGBOOST']

        logger.log_eval_start(filenames)

        # generate test data
        test_ds_numpy = Datasets.iterator_to_numpy(self.test_iter)
        test_y = np.argmax(np.array(list(chain(*test_ds_numpy[1]))), axis=1)
        X_test_features = self.extract_from_layer(self.test_iter, self.batch_size, FEAT_LAYER)

        # predict with boosting model
        pred_y_cnn, pred_y_xgb = self._predict(X_test_features=X_test_features)

        if plot:
            # baseline model
            Graphs.plot_classification_results(classes=list(self.test_iter.class_indices.keys()), test_y=test_y, pred_y=pred_y_cnn, title="BOOSTING: " + self.dirname + " CNN")
            # boosting model
            Graphs.plot_classification_results(classes=list(self.test_iter.class_indices.keys()), test_y=test_y, pred_y=pred_y_xgb, title="BOOSTING: " + self.dirname + " XGB")
            Graphs.plot_boosting_history(self.histories['cnn'], self.histories['xgb'], self.dirname, f"tmp/charts/boosting/{self.dirname}_boosting_hist.png")

        cnn_acc = metrics.accuracy_score(test_y, pred_y_cnn) * 100
        xgb_acc = metrics.accuracy_score(test_y, pred_y_xgb) * 100

        logger.log_eval_end(filenames, [cnn_acc, xgb_acc])
        return xgb_acc

    def _predict(self, X_test_features: list) -> Tuple[list, list]:
        """
        Predict - core function

        :param X_test_features: extracted test data for the xgb model
        :return:
            * pred_y_cnn - baseline cnn's predictions
            * pred_y_xgb - xgb boosting's predictions
        """
        dtest = xgb.DMatrix(X_test_features)
        pred_y_xgb = np.argmax(self.model_xgb.predict(dtest), axis=1)
        pred_y_cnn = np.argmax(self.model_cnn.predict(self.test_iter, batch_size=self.batch_size, verbose=1), axis=1)
        return pred_y_cnn, pred_y_xgb

    def predict_single(self, filename: str, *args) -> list:
        """
        Predict class for single image

        :param filename: image file name
        :return:
            * predicted: average probabilities of predicted classes
        """

        np_image = self.load_img_to_numpy(filename, self.img_size)
        X_test_features = self.extract_from_layer(np_image, self.batch_size, FEAT_LAYER)
        self.reload()
        predicted = self.model_xgb.predict(xgb.DMatrix(X_test_features))
        return predicted

    def predict_multiple(self, filenames: list, *args) -> list:
        """
        Predict class for multiple images

        :param filenames: list of image file names
        :return:
            * predicted: average probabilities of predicted classes for all samples
        """

        img_list = []
        for name in filenames:
            np_image = self.load_img_to_numpy(name, self.img_size)
            img_list.append(np_image)
        self.reload()
        X_test_features = self.extract_from_layer(np.vstack(img_list), self.batch_size, FEAT_LAYER)
        predicted = self.model_xgb.predict(xgb.DMatrix(X_test_features))
        return predicted

    def extract_from_layer(self, data: Union[DataFrameIterator, DirectoryIterator, np.ndarray], batch_size: int, layer_name: str) -> any:
        """
        Extract features from feature layer

        :param data: innput data
        :param batch_size: batch size
        :param layer_name: name of the layer to extract features from
        :return:
            * feature_layer_output - output data extracted from the feature layer
        """

        feature_layer_model: Model = tf.keras.Model(
            inputs=self.model_cnn.input,
            outputs=self.model_cnn.get_layer(layer_name).output)

        try:
            data.reset()
        except:
            pass
        feature_layer_output = feature_layer_model.predict(data, batch_size=batch_size, verbose=1)
        try:
            data.reset()
        except:
            pass
        return feature_layer_output
