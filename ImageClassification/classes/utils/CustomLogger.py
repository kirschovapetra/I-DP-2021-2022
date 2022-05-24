import logging
import os
from datetime import datetime, timedelta

import colorlog


class CustomLogger:
    """
    Custom logger

    Attributes

    ----------
    * logger: logger object
    * start_time: logging start time
    """

    logger: logging.Logger = None
    start_time: timedelta = None

    def __init__(self, project_root: str):
        colorlog.basicConfig(format='%(log_color)s%(asctime)s %(filename)s: [%(levelname)s] %(message)s')
        log = logging.getLogger(__name__)
        log.setLevel(logging.INFO)

        if not os.path.exists(f'{project_root}/tmp/logs'):
            os.makedirs(f'{project_root}/tmp/logs')

        fh = logging.FileHandler(f'{project_root}/tmp/logs/info.log')
        fh.setLevel(logging.INFO)
        fh.setFormatter(logging.Formatter('%(asctime)s %(filename)s: [%(levelname)s] %(message)s'))
        log.addHandler(fh)

        self.logger = log

    def log_training_start(self, filename):
        """
        Log training started

        :param filename: filename of trained model
        """

        self.start_time = datetime.now()
        self.logger.info(f'{filename} training started')

    def log_training_end(self, filename, loss, acc, val_loss, val_acc):
        """
        Log training ended

        :param filename: filename of trained model
        :param loss: training loss
        :param acc: training accuracy
        :param val_loss: validation loss
        :param val_acc: validation accuracy
        """

        self.logger.info(
            f'{filename} training finished. '
            f'Loss: {round(loss, 4)} - Accuracy: {round(acc, 4)} - '
            f'Val_loss: {round(val_loss, 4)} - Val_accuracy: {round(val_acc, 4)}. '
            f'Duration: {format(datetime.now() - self.start_time)}')
        self.start_time = None

    def log_eval_start(self, filename):
        """
        Log evaluation started

        :param filename: filename of evaluated model
        """

        self.start_time = datetime.now()
        self.logger.info(f'{filename} evaluation started')

    def log_eval_end(self, filename, accuracy):
        """
        Log evaluation ended

        :param filename: filename of evaluated model
        :param accuracy: evaluation accuracy
        """

        if type(filename) is not list: filename = [filename]
        if type(accuracy) is not list: accuracy = [accuracy]

        if len(filename) == 1:
            self.logger.info(
                f'{filename[0]} evaluation finished. '
                f'Accuracy on test set: {accuracy[0]:5.2f} %. '
                f'Duration: {format(datetime.now() - self.start_time)}')
        else:
            for i in range(len(filename)):
                log_msg = f'{filename[i]} evaluation finished. Accuracy on test set: {accuracy[i]:5.2f} %. '
                if i == len(filename) - 1:
                    log_msg += f'Duration: {format(datetime.now() - self.start_time)}\n'
                self.logger.info(log_msg)

        self.start_time = None

    def log_cust_time_end(self, filename, accuracy, time):
        """
        Log custom evaluation time

        :param filename: filename of evaluated model
        :param accuracy: evaluation accuracy
        :param time: custom duration
        """

        self.logger.info(
            f'{filename} evaluation finished. '
            f'Accuracy on test set: {accuracy:5.2f} %. '
            f'Duration: {format(time)}')

        self.start_time = None
