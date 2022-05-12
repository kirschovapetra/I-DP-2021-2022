from classes.cnn.BaseModel import PrimaryModel
from classes.two_step.SecondaryModel import SecondaryModel
from classes.utils.Constants import Dataset, LABELS_PRIMARY
from classes.utils.Datasets import Datasets
from classes.utils.Utils import Utils
from general import *


class TwoStepClassifier:
    model_primary: PrimaryModel = None
    model_secondary: SecondaryModel = None

    def __init__(self, model_primary, name_secondary, batch_size=100, epochs_secondary=20, checkpoint=50):
        Utils.validate_cnn(name_secondary)
        self.model_primary = model_primary
        self.model_secondary = SecondaryModel(name=name_secondary, batch_size=batch_size, epochs=epochs_secondary, checkpoint=checkpoint, train_gen_args=None)

    def predict_single(self, filename):
        """ Predict labels on test set """
        primary_pred = self.model_primary.predict_single(filename)
        primary_pred_label = np.argmax(primary_pred, axis=1)[0]
        secondary_pred = self.model_secondary.predict_single(filename, primary_pred_label)
        return primary_pred, secondary_pred

    def predict_multiple(self, filenames):
        """ Predict labels on test set """
        primary_preds = self.model_primary.predict_multiple(filenames)
        primary_preds_labels = np.argmax(primary_preds, axis=1)
        secondary_preds = self.model_secondary.predict_multiple(filenames, primary_preds_labels)
        return primary_preds, secondary_preds

    def evaluate(self):
        """ Evaluate 2-step and merged classifiers """

        _, test_df, _ = Datasets.load_dataset_df(Dataset.VEGA_MERGED.value, train_size=0.3)

        sample_list = list(test_df['filename'])
        correct_labels = list(test_df['class'])

        sec_start = datetime.now()
        sec_acc_dict, sec_acc = self.model_secondary.evaluate()
        sec_time = datetime.now() - sec_start

        # logging start
        logger.log_eval_start(f'2-step Classifier: PRIMARY - {self.model_primary.dirname} - SECONDARY - {self.model_secondary.dirname}')
        correct_2_step = 0

        two_step_start = datetime.now()
        primary_preds, secondary_preds = self.predict_multiple(sample_list)
        primary_preds_labels = np.argmax(primary_preds, axis=1)
        secondary_preds_labels = np.argmax(secondary_preds, axis=1)
        two_step_time = datetime.now() - two_step_start

        # loop over sample images
        for i, img_path in enumerate(sample_list):
            # primary classifier's prediction
            primary_class_result = LABELS_PRIMARY[primary_preds_labels[i]]
            # secondary classifier's prediction
            sec_classes_group = self.model_secondary.labels[primary_class_result]
            secondary_class_result = sec_classes_group[secondary_preds_labels[i]]

            # count correct predictions
            if secondary_class_result == correct_labels[i]:
                correct_2_step += 1

        two_step_acc = correct_2_step / len(sample_list) * 100

        # logging end + results
        logger.log_cust_time_end(f"Secondary (avg) - {self.model_secondary.dirname}", sec_acc, sec_time)
        logger.log_cust_time_end(f"2-step - {[self.model_primary.dirname, self.model_secondary.dirname]}", two_step_acc, two_step_time)

        return sec_acc, two_step_acc
