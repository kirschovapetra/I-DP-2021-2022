from keras.callbacks import EarlyStopping, Callback
from keras.utils.vis_utils import plot_model

from classes.cnn.BaseModel import PrimaryModel
from classes.utils.CustomCheckpoint import CustomCheckpoint
from classes.utils.Graphs import Graphs
from general import *


class SupervisedModel(PrimaryModel):
    """
    General class for a supervised cnn model

    Attributes

    ----------

    * name : Model name ('VGG19', 'ResNeXt50', 'ResNet50', 'InceptionV3' or 'Custom')
    * filename :  filename for trained model weights
    * lr : learning rate
    * model : cnn model (CustomModel / PretrainedModel)
    * history : training history
    * classes : mapping of class names to numeric values
    """

    name: str = ""
    filename: str = ""
    lr: float = 0.0001
    cb: Callback = None
    model: Model = None
    history: dict = None
    classes: dict = None

    def __init__(self, name: str = None, weights_dir: str = None, dirname: str = None, filename: str = None,
                 batch_size: int = 50, epochs: int = 10, lr: float = 0.0001, img_size: tuple = (32, 32),
                 checkpoint: int = None, dataset: str = None) -> None:

        super().__init__(dirname, weights_dir, batch_size, epochs, img_size, checkpoint, dataset)

        self.name = name
        self.filename = filename
        self.lr = lr

        # initialize directories to save trained models
        dir_path = os.path.join(self.weights_dir, self.dirname)
        if not os.path.exists(dir_path):
            os.makedirs(dir_path)

        # initialize callbacks
        self.cb = [EarlyStopping(monitor='val_loss', patience=5, min_delta=0.005)]

        if self.checkpoint is not None:
            self.cb.append(
                CustomCheckpoint(checkpoint=checkpoint, monitor='val_loss', verbose=1, save_best_only=True, save_weights_only=True,
                                 mode='min', filepath=os.path.join(dir_path, filename + '_ep{epoch}_vl{val_loss:.2f}.h5'))
            )

    def details(self, to_file: str):
        """
        Print model summary and export to file

        :param to_file: filename
        """

        print(self.model.summary())
        plot_model(self.model, show_shapes=True, to_file=to_file)

    @abstractmethod
    def _build(self, in_shape: tuple, out_shape: int):
        """
        Build model

        :param in_shape: input image shape (height, with, n_channels)
        :param out_shape:  output shape/ number of output classes
        """
        pass

    def train(self, train_iter: any, val_iter: any):
        """
        Train model

        :param train_iter: train dataframe iterator
        :param val_iter: validation dataframe iterator
        :return:
            * self.model: trained model
            * self.history: training history
            * self.classes: class mapping
        """

        # clear weights folder
        for f in glob.glob(os.path.join(self.weights_dir, self.filename + '/*')):
            os.remove(f)
        # log training start
        logger.log_training_start(f'{self.dataset}: {self.filename}')

        # train model
        hist = self.model.fit(x=train_iter, steps_per_epoch=train_iter.n // self.batch_size,
                              validation_data=val_iter, validation_steps=val_iter.n // self.batch_size,
                              epochs=self.epochs, shuffle=False, callbacks=self.cb, verbose=1)
        self.history = hist.history

        self.classes = dict((int(v), k) for k, v in train_iter.class_indices.items())
        # log training end
        logger.log_training_end(f'{self.dataset}: {self.filename}',
                                self.history["loss"][-1], self.history["accuracy"][-1],
                                self.history["val_loss"][-1], self.history["val_accuracy"][-1])

        # save trained model
        path = os.path.join(self.weights_dir, self.dirname)
        self.model.save(os.path.join(path, self.filename + '.h5'), include_optimizer=False)

        # save history and class mapping
        with open(os.path.join(path, self.filename + '_history.json'), 'w') as file:
            json.dump(self.history, file)
        with open(os.path.join(path, self.filename + '_metadata.json'), 'w') as file:
            json.dump(self.classes, file)

        return self.model, self.history, self.classes

    def evaluate(self, test_iter: DataFrameIterator, plot=True, *args) -> any:
        """
         Evaluate model's accuracy on test set

        :param test_iter: test dataframe iterator
        :param plot: plot graph or not
        :return:
            * acc: accurracy score on test set
        """

        # logging start
        logger.log_eval_start(f'{self.dataset}: {self.filename}')
        predicted = self.model.predict(test_iter, verbose=0, batch_size=self.batch_size)
        acc = metrics.accuracy_score(test_iter.labels, np.argmax(predicted, axis=1)) * 100

        # plot results
        if plot:
            Graphs.plot_classification_results(classes=list(test_iter.class_indices.keys()),
                                               test_y=np.array(test_iter.labels),
                                               pred_y=np.argmax(predicted, axis=1),
                                               title=self.filename)
            Graphs.plot_history(self.history, self.filename)

        # logging end
        logger.log_eval_end(f'{self.dataset}: {self.filename}', acc)

        return acc

    def reload(self, verbose: int = 1, *args) -> Tuple[Model, dict, dict]:
        """
        Reload trained model from file

        :return:
            * mdl: loaded model
            * hist: loaded training history
            * cl: class mapping
        """

        mdl, hist, cl = self._reload_all(self.weights_dir, self.dirname, self.filename, verbose)

        if mdl is not None:
            self.model = mdl
        if hist is not None:
            self.history = hist
        if cl is not None:
            self.classes = cl

        return mdl, hist, cl

    def predict_single(self, filename: str, verbose: int = 0) -> list:
        """
        Predict class for single image
        :param filename: image file name
        :param verbose: show (1) or hide (0) log
        :return:
            * predicted: probabilities of predicted classes
        """

        np_image = self.load_img_to_numpy(filename, self.img_size)
        predicted = self.model.predict(np_image, verbose=verbose)
        return predicted

    def predict_multiple(self, filenames: list, verbose: int = 0) -> list:
        """
        Predict class for multiple images

        :param filenames: list of image file names
        :param verbose: show (1) or hide (0) log
        :return:
            * predicted: probabilities of predicted classes for all samples
        """

        img_list = []
        sleep(0.01)
        lst_loop = tqdm(filenames) if verbose == 1 else filenames
        for name in lst_loop:
            np_image = self.load_img_to_numpy(name, self.img_size)
            img_list.append(np_image)

        predicted = self.model.predict(np.vstack(img_list), batch_size=self.batch_size, verbose=verbose)
        return predicted
