import enum
from abc import abstractmethod
from time import sleep
from typing import Tuple, Union, Callable
from tqdm import tqdm
import glob
import logging
import colorlog
import warnings
from datetime import datetime
import json
import pandas as pd
import numpy as np
from PIL import Image
from keras import Model, layers
from keras.models import load_model
from keras_preprocessing.image import ImageDataGenerator, DirectoryIterator
from keras_preprocessing import image
from sklearn import metrics, decomposition, model_selection
from keras.preprocessing.image import DataFrameIterator
from skimage import transform
from cv2 import cv2
from datetime import timedelta
import os
import tensorflow as tf
from classes.utils.CustomLogger import CustomLogger

''' ------------------------- CONFIG ---------------------------- '''

os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'
tf.get_logger().setLevel('ERROR')

PROJECT_ROOT = os.path.dirname(os.path.abspath(__file__))

logger = CustomLogger(PROJECT_ROOT)
