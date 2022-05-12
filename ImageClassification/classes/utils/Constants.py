import enum

TRAIN_ARGS_DEFAULT = {
    'horizontal_flip': True,
    'rotation_range': 10,
    'width_shift_range': 1,
    'height_shift_range': 1,
}


class Dataset(enum.Enum):
    DIDA = 'dida'
    MNIST = 'mnist'
    VEGA_PRIMARY = 'vega_primary'
    VEGA_PRIMARY_SPLIT = 'vega_primary_split'
    VEGA_PRIMARY_SPLIT_DEN = 'vega_primary_split_den'
    VEGA_PRIMARY_SPLIT_THR = 'vega_primary_split_thr'
    VEGA_SECONDARY = 'vega_secondary'
    VEGA_MERGED = 'vega_merged'


class CnnName(enum.Enum):
    VGG19 = 'VGG19'
    INCEPTIONV3 = 'InceptionV3'
    RESNET50 = 'ResNet50'
    RESNEXT50 = 'ResNeXt50'
    CUSTOM = 'Custom'


class MlMethod(enum.Enum):
    CNN = 'cnn'
    BAGGING = 'bagging'
    BOOSTING = 'boosting'
    STACKING = 'stacking'


LABELS_SECONDARY = {
    0: {0: '0', 1: '0^0', 2: '0^2', 3: '0^I', 4: '0^II'},
    1: {0: '1', 1: '1^0', 2: '1^I', 3: '1^II'},
    2: {0: '2', 1: '2^2', 2: '2^I', 3: '2^II'},
    3: {0: '3', 1: '3^0', 2: '3^2', 3: '3^I', 4: '3^II'},
    4: {0: '4', 1: '4^0', 2: '4^2', 3: '4^I', 4: '4^II'},
    5: {0: '5', 1: '5^0', 2: '5^2', 3: '5^I', 4: '5^II'},
    6: {0: '6', 1: '6-I', 2: '6-II', 3: '6^2'},
    7: {0: '7', 1: '7^0', 2: '7^2', 3: '7^I', 4: '7^II'},
    8: {0: '8', 1: '8^0', 2: '8^2', 3: '8^I', 4: '8^II'},
    9: {0: '9', 1: '9-I', 2: '9-II', 3: '9^0', 4: '9^2', 5: '9^I'}
}
LABELS_MERGED_GEN = {'0': 0, '0^0': 1, '0^2': 2, '0^I': 3, '0^II': 4,
                     '1': 5, '1^0': 6, '1^I': 7, '1^II': 8,
                     '2': 9, '2^2': 10, '2^I': 11, '2^II': 12,
                     '3': 13, '3^0': 14, '3^2': 15, '3^I': 16, '3^II': 17,
                     '4': 18, '4^0': 19, '4^2': 20, '4^I': 21, '4^II': 22,
                     '5': 23, '5^0': 24, '5^2': 25, '5^I': 26, '5^II': 27,
                     '6': 28, '6-I': 29, '6-II': 30, '6^2': 31,
                     '7': 32, '7^0': 33, '7^2': 34, '7^I': 35, '7^II': 36,
                     '8': 37, '8^0': 38, '8^2': 39, '8^I': 40, '8^II': 41,
                     '9': 42, '9-I': 43, '9-II': 44, '9^0': 45, '9^2': 46, '9^I': 47}

LABELS_MERGED = {0: '0', 1: '0^0', 2: '0^2', 3: '0^I', 4: '0^II',
                 5: '1', 6: '1^0', 7: '1^I', 8: '1^II',
                 9: '2', 10: '2^2', 11: '2^I', 12: '2^II',
                 13: '3', 14: '3^0', 15: '3^2', 16: '3^I', 17: '3^II',
                 18: '4', 19: '4^0', 20: '4^2', 21: '4^I', 22: '4^II',
                 23: '5', 24: '5^0', 25: '5^2', 26: '5^I', 27: '5^II',
                 28: '6', 29: '6-I', 30: '6-II', 31: '6^2',
                 32: '7', 33: '7^0', 34: '7^2', 35: '7^I', 36: '7^II',
                 37: '8', 38: '8^0', 39: '8^2', 40: '8^I', 41: '8^II',
                 42: '9', 43: '9-I', 44: '9-II', 45: '9^0', 46: '9^2', 47: '9^I'}

LABELS_PRIMARY_STR = [str(i) for i in range(10)]
LABELS_PRIMARY = list(range(10))
