from Main_ensemble import boosting
from classes.test.TestSupervised import TestSupervised
from classes.utils.Constants import CnnName, Dataset, TRAIN_ARGS_DEFAULT
from classes.utils.Datasets import Datasets
from classes.utils.Utils import Utils

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


def main_cnn_custom_iter(TRAIN_ITER, TEST_ITER, VAL_ITER, NAME, BATCH_SIZE=100, EPOCHS=20, TRAIN_GEN_ARGS=TRAIN_ARGS_DEFAULT, DATASET=None, RELOAD=False):
    acc, mdl = TestSupervised.run_custom_iter(train_iter=TRAIN_ITER, val_iter=VAL_ITER, test_iter=TEST_ITER, name=NAME, dataset=DATASET,
                                              batch_size=BATCH_SIZE, epochs=EPOCHS, reload=RELOAD, train_gen_args=TRAIN_GEN_ARGS)
    Utils.reset_keras(mdl.model)
    Utils.reset_keras(mdl)
    # print(NAME + ":", str(TRAIN_GEN_ARGS))
    return acc


def main_cnn_preprocessing(NAMES=None, BATCH_SIZE=100, EPOCHS=20, IMG_SIZE=(32, 32), DATASET=Dataset.VEGA_PRIMARY.value, train_gen_args=None, RELOAD=False):
    train_df, test_df, val_df = Datasets.load_dataset_df(DATASET)

    test_df = pd.concat([test_df, Datasets.load_df('datasets/vega/test_sample_rot_shift_zoom')], ignore_index=True)

    _, test_iter, _ = Datasets.get_iterators_from_df(img_size=IMG_SIZE, batch_size=BATCH_SIZE, test_df=test_df)
    acc_dict = {}
    for name in NAMES:
        train_iter, _, val_iter = Datasets.get_iterators_from_df(
            img_size=IMG_SIZE, batch_size=BATCH_SIZE, train_gen_args=train_gen_args, train_df=train_df, val_df=val_df)
        acc = main_cnn_custom_iter(TRAIN_ITER=train_iter, TEST_ITER=test_iter, VAL_ITER=val_iter, NAME=name, EPOCHS=EPOCHS, BATCH_SIZE=BATCH_SIZE,
                                   RELOAD=RELOAD, TRAIN_GEN_ARGS=train_gen_args, DATASET=DATASET)
        acc_dict[name] = acc

    print(f'########### {train_gen_args} ###############')
    for x in acc_dict.keys():
        print(x, acc_dict[x])
    print('########################################### ')


if __name__ == '__main__':
    with warnings.catch_warnings():
        warnings.simplefilter("ignore")

        # main_cnn(NAMES=[x.value for x in CnnName], DATASETS=[Dataset.VEGA_PRIMARY.value], RELOAD=True)
        # main_cnn(NAMES=[x.value for x in CnnName], DATASETS=[Dataset.DIDA.value], RELOAD=True)
        # main_cnn(NAMES=[x.value for x in CnnName], DATASETS=[Dataset.MNIST.value], RELOAD=True)

        fr = {
            'horizontal_flip': True,
            'rotation_range': 10,
        }

        frs = {
            'horizontal_flip': True,
            'rotation_range': 10,
            'width_shift_range': 1,
            'height_shift_range': 1,
        }

        frssz = {
            'horizontal_flip': True,
            'rotation_range': 10,
            'width_shift_range': 1,
            'height_shift_range': 1,
            'shear_range': 0.2,
            'zoom_range': 0.1
        }

        main_cnn_preprocessing([
            CnnName.VGG19.value,
            CnnName.RESNET50.value,
            CnnName.RESNEXT50.value,
            CnnName.CUSTOM.value,
        ], train_gen_args=frssz, RELOAD=False)

        main_cnn_preprocessing([
            CnnName.INCEPTIONV3.value,
        ], IMG_SIZE=(75, 75), train_gen_args=frssz, RELOAD=False)
