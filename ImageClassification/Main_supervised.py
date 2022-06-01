from classes.test.TestSupervised import TestSupervised
from classes.utils.Constants import CnnName, Dataset, TRAIN_ARGS_DEFAULT

from general import *

NAMES_ALL = [cnn.value for cnn in CnnName]


def main_cnn(NAMES, DATASETS, BATCH_SIZE=100, EPOCHS=20, TRAIN_GEN_ARGS=TRAIN_ARGS_DEFAULT, SAVE_SAMPLE=False, RELOAD=False):
    for dataset in DATASETS:
        acc_dict, names = TestSupervised.run_all(names=NAMES, dataset=dataset, batch_size=BATCH_SIZE, epochs=EPOCHS, reload=RELOAD, save_sample=SAVE_SAMPLE,
                                                 train_gen_args=TRAIN_GEN_ARGS)

        print('*******************************************************************************************************************************')
        print(dataset)
        for x in acc_dict.keys():
            print(x, acc_dict[x])
        print('*******************************************************************************************************************************')


if __name__ == '__main__':
    with warnings.catch_warnings():
        warnings.simplefilter("ignore")

        # reload=False for training new models, reload=True for loading saved models

        # train and test base cnn models
        main_cnn(NAMES=[x.value for x in CnnName], DATASETS=[Dataset.VEGA_PRIMARY.value], RELOAD=False)