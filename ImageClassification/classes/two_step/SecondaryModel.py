from classes.cnn.BaseModel import BaseModel
from statistics import mean
from classes.utils.Constants import Dataset, LABELS_SECONDARY
from classes.utils.Datasets import Datasets
from classes.utils.Utils import Utils
from general import *


class SecondaryModel(BaseModel):
    name: str = ''
    train_gen_args: dict = None
    dataset: str = Dataset.VEGA_SECONDARY.value
    labels: dict = LABELS_SECONDARY
    train_size: float = 0.7
    filenames: dict = {}
    full_paths: dict = {}
    train_iters: dict = {}
    test_iters: dict = {}
    val_iters: dict = {}

    def __init__(self, name: str, batch_size: int, epochs: int, checkpoint: int, train_gen_args: dict) -> None:
        self.name = name
        self.train_gen_args = train_gen_args
        img_size, _ = Utils.get_training_params(name)

        weights_dir = os.path.join('weights/cnn', self.dataset)
        filename_dirname = Utils.init(weights_dir, name, epochs, train_gen_args)

        super().__init__(filename_dirname, weights_dir, batch_size, epochs, img_size, checkpoint, self.dataset)
        self._init_models()

    def _init_models(self):
        self.filenames = {}
        self.full_paths = {}
        self.train_iters = {}
        self.test_iters = {}
        self.val_iters = {}
        for label_id in self.labels.keys():
            self.full_paths[label_id] = os.path.join(self.weights_dir, self.dirname, str(label_id))
            self.filenames[label_id] = self.dirname
            self.train_iters[label_id], self.test_iters[label_id], self.val_iters[label_id] = Datasets.load_dataset_iter(
                dataset=self.dataset, train_size=self.train_size, img_size=self.img_size, batch_size=self.batch_size,
                train_gen_args=self.train_gen_args, label_id=label_id
            )

    def train(self):
        """ Train secondary classifiers """
        print(f"\nTraining secondary classifiers")
        for label_id in self.labels.keys():
            print(f"\n---------------------------- {label_id} -------------------------------")
            model = Utils.init_model(name=self.name, weights_dir=self.full_paths[label_id], dirname=self.filenames[label_id],
                                     filename=self.filenames[label_id], batch_size=self.batch_size, epochs=self.epochs,
                                     out_shape=len(self.labels[label_id]), checkpoint=self.checkpoint, dataset=self.dataset)
            model.train(self.train_iters[label_id], self.val_iters[label_id])
            Utils.reset_keras(model.model)
            Utils.reset_keras(model)

    def predict_single(self, filename: str, primary_pred_class: int) -> Tuple[list, timedelta]:
        """
        Predict with secondary classifier

        :param filename: image file name
        :param primary_pred_class: single prediction result from primary dataset
        :return:
            * pred_y_classes - prediction results
            * time_elapsed - duration of prediction
        """

        model = self.reload_i(primary_pred_class)
        pred_y = model.predict_single(filename)
        Utils.reset_keras(model.model)
        Utils.reset_keras(model)
        return pred_y

    def predict_multiple(self, filenames: list, primary_pred_classes: list) -> Tuple[list, timedelta]:
        """
        Predict with secondary classifier

        :param filenames: list of sample filenames
        :param primary_pred_classes: prediction results from primary dataset
        :return:
            * pred_y_classes - prediction results
            * time_elapsed - duration of prediction
        """

        df = pd.DataFrame({
            'filename': filenames,
            'class': primary_pred_classes,
            'pred_y': [None for i in range(len(filenames))]
        })
        df['pred_y'] = df['pred_y'].astype(object)

        df_group = df.groupby('class')

        for label_id in self.labels.keys():
            print(f"\n---------------------------- {label_id} -------------------------------")
            try:
                df_i = df_group.get_group(label_id)
                model_i = self.reload_i(label_id)
                pred_y = model_i.predict_multiple(list(df_i['filename']))
                for i, df_idx in enumerate(df_i.index):
                    df['pred_y'][df_idx] = np.pad(pred_y[i], (0, 10 - len(pred_y[i])), mode='constant')
                Utils.reset_keras(model_i.model)
                Utils.reset_keras(model_i)
            except Exception as e:
                print(e)

        return np.array(list(df['pred_y']))

    def evaluate(self):
        acc_dict = {}
        # loop over labels (0-9)
        for label_id in self.labels.keys():
            print(f"\n---------------------------- {label_id} -------------------------------")

            # initialize secondary dataset for a label
            model = self.reload_i(label_id)
            accuracy = model.evaluate(self.test_iters[label_id], plot=False)
            # save accuracy
            acc_dict[label_id] = accuracy
            Utils.reset_keras(model.model)
            Utils.reset_keras(model)

        average_acc = mean(list(acc_dict.values()))
        return acc_dict, average_acc

    def reload_i(self, label_id: int):
        model = Utils.init_model(name=self.name, weights_dir=self.full_paths[label_id], dirname=self.filenames[label_id], filename=self.filenames[label_id],
                                 batch_size=self.batch_size, epochs=self.epochs, out_shape=len(self.labels[label_id]), checkpoint=self.checkpoint, dataset=self.dataset)
        model.reload(verbose=1)
        return model
