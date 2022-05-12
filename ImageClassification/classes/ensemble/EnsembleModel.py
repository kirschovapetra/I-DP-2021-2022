from classes.cnn.BaseModel import PrimaryModel
from general import *


class EnsembleModel(PrimaryModel):
    """
    Abstract class representing general ensemble model

    Attributes

    ----------

    * weights_dir : base directory for trained model weights
    * train_df : training dataframe
    * test_df : testing data
    * histories : training history for each classifier dict{filename: history}
    """

    weights_dir: str = 'weights/ensemble/'
    train_df: pd.DataFrame = None
    test_df: pd.DataFrame = None
    histories: dict = {}

    def __init__(self, weights_dir: str, dirname: str, train_df: pd.DataFrame, test_df: pd.DataFrame,
                 epochs: int, batch_size: int, img_size: tuple, checkpoint: int, dataset: str) -> None:
        super().__init__(dirname, weights_dir, batch_size, epochs, img_size, checkpoint, dataset)
        self.dirname = dirname
        self.train_df = train_df
        self.test_df = test_df

        if not os.path.exists(self.weights_dir):
            os.makedirs(self.weights_dir)

        path = os.path.join(self.weights_dir, self.dirname)
        if not os.path.exists(path):
            os.makedirs(path)

    def reload(self, verbose: int = 1, *args):
        pass

    def train(self, *args):
        pass

    def _predict(self, *args):
        pass

    def evaluate(self, plot=True, *args):
        pass
