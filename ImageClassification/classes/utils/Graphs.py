import math

import seaborn as sb
from matplotlib import pyplot as plt

from general import *


class Graphs:
    """ Various graph-plotting methods """

    @staticmethod
    def show_image_samples(df_iterator: DataFrameIterator, cmap: str = None, **kwargs):
        """
        Plot samples from dataframe iterator
        Source: https://www.kaggle.com/gpiosenka/features-a-custom-callback-you-may-like-to-use

        :param df_iterator: dataframe iterator
        :param cmap: color map (https://matplotlib.org/stable/gallery/color/colormap_reference.html)
        :param kwargs:
            * classes: class names
        """

        plt.figure(figsize=(20, 20))

        images, labels = next(df_iterator)

        n = len(images) if len(images) < 100 else 100
        dim1 = int(math.sqrt(n)) + 1
        for i in range(n):
            plt.subplot(dim1, dim1, i + 1)
            plt.imshow(images[i], cmap=cmap)
            if "classes" in kwargs.keys():
                idx = np.argmax(labels[i])
                plt.title(kwargs.get("classes")[idx], color='red', fontsize=25, y=-0.18)
            plt.axis('off')
        plt.show()

    @staticmethod
    def plot_classification_results(classes: list, test_y: list, pred_y: list, title: str):
        """
        Plot confusion matrix and print classification report
        Source: https://www.kaggle.com/gpiosenka/features-a-custom-callback-you-may-like-to-use

        :param title: graph title
        :param classes: class names
        :param test_y: test labels
        :param pred_y: predicted labels
        """
        plt.style.use('fivethirtyeight')
        plt.figure(figsize=(len(classes) // 2 + 4, len(classes) // 2 + 4))
        sb.heatmap(metrics.confusion_matrix(test_y, pred_y),
                   annot=True, vmin=0, fmt='g', cmap='Blues', cbar=False,
                   xticklabels=classes, yticklabels=classes)
        plt.xlabel("Predicted")
        plt.ylabel("Actual")
        plt.title("Confusion Matrix - " + title)
        plt.tight_layout()
        plt.savefig(f'tmp/charts/{title}_conf.png', transparent=True)
        plt.show()

        print("\nClassification Report:\n----------------------\n",
              metrics.classification_report(test_y, pred_y, target_names=classes, zero_division=1, digits=4))

    @staticmethod
    def plot_history(history: dict, title: str):
        """
        Plot training history - loss and accurracy
        Source: https://www.kaggle.com/gpiosenka/features-a-custom-callback-you-may-like-to-use

        :param history: training history returned by fit() function
        :param title: graph title
        """

        plt.style.use('fivethirtyeight')
        fig, axes = plt.subplots(nrows=1, ncols=2, figsize=(20, 8))
        plt.suptitle(title)
        # -------------- loss -----------------

        loss = history['loss']
        val_loss = history['val_loss']

        epochs = list(map(str, range(1, len(loss) + 1))) if len(loss) < 30 else range(1, len(loss) + 1)

        axes[0].plot(epochs, loss, label='Training loss')
        axes[0].plot(epochs, val_loss, label='Validation loss')
        axes[0].set_title('Training and Validation Loss')
        axes[0].set_xlabel('Epochs')
        axes[0].set_ylabel('Loss')

        axes[0].legend()

        # -------------- acc -----------------

        acc = history['accuracy']
        val_acc = history['val_accuracy']
        best_epoch_id = np.argmax(val_acc)

        axes[1].plot(epochs, acc, label='Training Accuracy')
        axes[1].plot(epochs, val_acc, label='Validation Accuracy')
        axes[1].set_title('Training and Validation Accuracy')
        axes[1].set_xlabel('Epochs')
        axes[1].set_ylabel('Accuracy')
        axes[1].legend()
        plt.tight_layout()
        plt.savefig(f'tmp/charts/{title}_hist.png', transparent=True)
        plt.show()

    @staticmethod
    def plot_ensemble_history(histories: dict, save_as: str):
        """
        Plot ensemble training history - loss and accurracy

        :param histories: training history for each classifier
        :param save_as: filename
        """

        n_graphs = len(histories)

        plt.style.use('fivethirtyeight')
        fig, axes = plt.subplots(nrows=n_graphs, ncols=2, figsize=(25, 7 * n_graphs))
        i = 0

        for title, history in histories.items():
            Graphs.plot_history_i(axes, history, title, i)
            i += 1
        plt.savefig(save_as, transparent=True)
        plt.tight_layout()
        plt.show()

    @staticmethod
    def plot_boosting_history(model_cnn_history: dict, model_xgb_history: dict, title: str, save_as: str):
        """
        Plot ensemble boosting history - loss and accurracy

        :param model_cnn_history: training history of baseline cnn model
        :param model_xgb_history: training history of xgb model
        :param title: graph title
        :param save_as: filename
        """
        plt.style.use('fivethirtyeight')
        plt.title(title)
        fig, axes = plt.subplots(nrows=2, ncols=2, figsize=(20, 15))
        Graphs.plot_history_i(axes, model_cnn_history, "CNN", 0)
        Graphs.plot_xgboost_history_i(axes, model_xgb_history, "XGBOOST", 1)

        plt.savefig(save_as, transparent=True)
        plt.tight_layout()
        plt.show()

    @staticmethod
    def plot_xgboost_history_i(axes: any, history: dict, title: str, i: int):
        """
        Plot xgboost history - loss and accurracy

        :param axes: graph axes
        :param history: training history
        :param title: sub-graph title
        :param i: index of axis
        """
        # -------------- loss -----------------

        loss = history['train']['mlogloss']
        val_loss = history['val']['mlogloss']

        epochs = list(map(str, range(1, len(loss) + 1))) if len(loss) < 30 else range(1, len(loss) + 1)

        axes[i, 0].plot(epochs, loss, label='Training loss')
        axes[i, 0].plot(epochs, val_loss, label='Validation loss')
        axes[i, 0].set_title(f'Training and Validation Loss: {title}')
        axes[i, 0].set_xlabel('Epochs')
        axes[i, 0].set_ylabel('Loss')
        axes[i, 0].legend()

        # -------------- acc -----------------

        acc = history['train']['accuracy']
        val_acc = history['val']['accuracy']

        axes[i, 1].plot(epochs, acc, label='Training Accuracy')
        axes[i, 1].plot(epochs, val_acc, label='Validation Accuracy')
        axes[i, 1].set_title(f'Training and Validation Accuracy: {title}')
        axes[i, 1].set_xlabel('Epochs')
        axes[i, 1].set_ylabel('Accuracy')
        axes[i, 1].legend()

        plt.tight_layout()

    @staticmethod
    def plot_history_i(axes: any, history: dict, title: str, i: int):
        """
        Plot training history of weak classifier with i-th index

        :param axes: graph axes
        :param history: training history
        :param title: chart title
        :param i: index of the classifier
        """

        # -------------- loss -----------------

        loss = history['loss']
        val_loss = history['val_loss']

        epochs = list(map(str, range(1, len(loss) + 1))) if len(loss) < 30 else range(1, len(loss) + 1)

        axes[i, 0].plot(epochs, loss, label='Training loss')
        axes[i, 0].plot(epochs, val_loss, label='Validation loss')
        axes[i, 0].set_title(f'Training and Validation Loss: {title}')
        axes[i, 0].set_xlabel('Epochs')
        axes[i, 0].set_ylabel('Loss')
        axes[i, 0].legend()

        # -------------- acc -----------------

        acc = history['accuracy']
        val_acc = history['val_accuracy']

        axes[i, 1].plot(epochs, acc, label='Training Accuracy')
        axes[i, 1].plot(epochs, val_acc, label='Validation Accuracy')
        axes[i, 1].set_title(f'Training and Validation Accuracy: {title}')
        axes[i, 1].set_xlabel('Epochs')
        axes[i, 1].set_ylabel('Accuracy')
        axes[i, 1].legend()

        plt.tight_layout()
