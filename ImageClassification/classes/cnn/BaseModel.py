from classes.utils.Constants import Dataset
from general import *


class BaseModel:
    """
    Abstract class representing general keras model

    Attributes

    ----------

    * dirname : subdirectory name for trained model weights
    * weights_dir : base directory for trained model weights
    * batch_size : batch size
    * epochs : number of epochs
    * img_size : image size (height, width)
    * checkpoint : number of epoch from which to run callback
    * dataset : dataset name
    """

    dirname: str = ""
    weights_dir: str = ""
    batch_size: int = 100
    epochs: int = 20
    img_size: tuple = (32, 32)
    checkpoint: int = None
    dataset: str = Dataset.VEGA_PRIMARY.value

    def __init__(self, dirname, weights_dir, batch_size, epochs, img_size, checkpoint, dataset) -> None:
        super().__init__()
        self.dirname = dirname
        self.weights_dir = weights_dir
        self.batch_size = batch_size
        self.epochs = epochs
        self.img_size = img_size
        self.checkpoint = checkpoint
        self.dataset = dataset

    @staticmethod
    def _reload_all(weights_dir: str, dirname: str, filename: str, verbose: int = 1) -> Tuple[Model, dict, dict]:
        """
        Reload model, history and classes from files

        :param weights_dir: base directory for trained model weights
        :param dirname: subdirectory name for trained model weights
        :param filename: filename for trained model weights
        :param verbose: show (1) or hide (0) log
        :return:
            * model: loaded cnn model
            * history: loaded training history
            * classes: loaded class mapping
        """
        model = BaseModel._reload_model(weights_dir, dirname, filename, verbose)
        history = BaseModel._reload_hist(weights_dir, dirname, filename)
        classes = None
        try:
            with open(os.path.join(weights_dir, dirname, filename + '_metadata.json')) as file:
                classes = json.load(file)
        except Exception as e:
            print(e)
        return model, history, classes

    @staticmethod
    def _reload_model(weights_dir: str, dirname: str, filename: str, verbose: int = 1) -> Model:
        """
        Reload model, history and classes from files

        :param weights_dir: base directory for trained model weights
        :param dirname: subdirectory name for trained model weights
        :param filename: filename for trained model weights
        :param verbose: show (1) or hide (0) log
        :return:
            * model: loaded cnn model
        """
        path = os.path.join(weights_dir, dirname)
        path_file = os.path.join(path, filename + '.h5')
        model = None
        try:
            model = load_model(path_file, compile=False)
            if verbose == 1:
                print(f"Loaded model from file: {path_file}")
        except Exception as e:
            print(e)
        return model

    @staticmethod
    def _reload_hist(weights_dir: str, dirname: str, filename: str) -> dict:
        """
        Reload model, history and classes from files

        :param weights_dir: base directory for trained model weights
        :param dirname: subdirectory name for trained model weights
        :param filename: filename for trained model weights
        :return:
            * history: loaded training history
        """
        path = os.path.join(weights_dir, dirname)
        history = None
        try:
            with open(os.path.join(path, filename + '_history.json')) as file:
                history = json.load(file)
        except Exception as e:
            print(e)
        return history

    @staticmethod
    def load_img_to_numpy(filename: str, img_size: tuple) -> np.ndarray:
        """
        Convert pillow image to numpy array
        :param filename: image file name
        :param img_size: image size (height, width)
        :return:
            * np_image - numpy array from image
        """
        np_image = Image.open(filename)
        np_image = np.array(np_image).astype('float32') / 255.
        np_image = transform.resize(np_image, img_size + (3,))
        np_image = np.expand_dims(np_image, axis=0)
        return np_image


class PrimaryModel(BaseModel):
    @abstractmethod
    def reload(self, verbose: int = 1, *args):
        """ Reload model """
        pass

    @abstractmethod
    def train(self, *args):
        """ Train model """
        pass

    @abstractmethod
    def _predict(self, *args):
        """ Predict labels on test set """
        pass

    @abstractmethod
    def evaluate(self, *args):
        """ Evaluate model's accurracy """
        pass

    def predict_single(self, filenames: list, verbose: int = 0) -> np.ndarray:
        """ Predict single image """
        pass

    def predict_multiple(self, filenames: list, verbose: int = 0) -> np.ndarray:
        """ Predict multiple images """
        pass
