from itertools import combinations_with_replacement

from classes.test.TestTwoStepClassifier import TestTwoStepClassifier
from classes.utils.Constants import CnnName, TRAIN_ARGS_DEFAULT
from general import *

NAMES_ALL = [cnn.value for cnn in CnnName]
PAIRS = list(combinations_with_replacement(NAMES_ALL, 2))


def main_2_step_cnn(NAME_PRIMARY, NAME_SECONDARY, BATCH_SIZE=100, EPOCHS_PRIM=20, EPOCHS_SEC=20, TRAIN_GEN_ARGS=TRAIN_ARGS_DEFAULT, RELOAD_PRIM=False, RELOAD_SEC=False):
    print("----------------------- 2-STEP CNN ------------------------------")
    print(f"--- Primary: {NAME_PRIMARY}\n--- Secondary: {NAME_SECONDARY}\n------------------------------")
    prim_acc, sec_acc, two_step_acc = TestTwoStepClassifier.run_2step_cnn(
        name_primary=NAME_PRIMARY,
        name_secondary=NAME_SECONDARY,
        batch_size=BATCH_SIZE,
        epochs_primary=EPOCHS_PRIM,
        epochs_secondary=EPOCHS_SEC,
        train_gen_args=TRAIN_GEN_ARGS,
        reload_primary=RELOAD_PRIM,
        reload_secondary=RELOAD_SEC
    )

    print('***************************')
    print(f'prim_acc: {prim_acc}\n'
          f'sec_acc: {sec_acc}\n'
          f'two_step_acc: {two_step_acc}')
    print('***************************')


def main_2_step_stacking(NAMES_PRIMARY, NAME_SECONDARY, BATCH_SIZE=100, EPOCHS_PRIM=20, EPOCHS_SEC=20, TRAIN_GEN_ARGS=TRAIN_ARGS_DEFAULT,
                         N_FOLDS=2, RELOAD_PRIM=False, RELOAD_SEC=False):
    print("----------------------- 2-STEP STACKING ------------------------------")
    print(f"--- Primary: {NAMES_PRIMARY}\n--- Secondary: {NAME_SECONDARY}\n------------------------------")
    prim_acc, sec_acc, two_step_acc = TestTwoStepClassifier.run_2step_stacking(
        names=NAMES_PRIMARY,
        name_secondary=NAME_SECONDARY,
        batch_size=BATCH_SIZE,
        n_folds=N_FOLDS,
        epochs_primary=EPOCHS_PRIM,
        epochs_secondary=EPOCHS_SEC,
        train_gen_args=TRAIN_GEN_ARGS,
        reload_primary=RELOAD_PRIM,
        reload_secondary=RELOAD_SEC
    )

    print('***************************')
    print(f'prim_acc: {prim_acc}\n'
          f'sec_acc: {sec_acc}\n'
          f'two_step_acc: {two_step_acc}')
    print('***************************')


def main_2_step_bagging(NAME_PRIMARY, NAME_SECONDARY, BATCH_SIZE=100, EPOCHS_PRIM=20, EPOCHS_SEC=20, N_EST=2,
                        TRAIN_GEN_ARGS=TRAIN_ARGS_DEFAULT, RELOAD_PRIM=False, RELOAD_SEC=False):
    print("----------------------- 2-STEP BAGGING ------------------------------")
    print(f"--- Primary: {NAME_PRIMARY}\n--- Secondary: {NAME_SECONDARY}\n------------------------------")
    prim_acc, sec_acc, two_step_acc = TestTwoStepClassifier.run_2step_bagging(
        name_primary=NAME_PRIMARY,
        name_secondary=NAME_SECONDARY,
        batch_size=BATCH_SIZE,
        n_est=N_EST,
        epochs_primary=EPOCHS_PRIM,
        epochs_secondary=EPOCHS_SEC,
        train_gen_args=TRAIN_GEN_ARGS,
        reload_primary=RELOAD_PRIM,
        reload_secondary=RELOAD_SEC
    )

    print('***************************')
    print(f'prim_acc: {prim_acc}\n'
          f'sec_acc: {sec_acc}\n'
          f'two_step_acc: {two_step_acc}')
    print('***************************')


def main_2_step_boosting(NAME_PRIMARY, NAME_SECONDARY, BATCH_SIZE=100, EPOCHS_PRIM=20, EPOCHS_XGB=50, EPOCHS_SEC=20,
                         TRAIN_GEN_ARGS=TRAIN_ARGS_DEFAULT, RELOAD_PRIM=False, RELOAD_SEC=False):
    print("----------------------- 2-STEP BOOSTING ------------------------------")
    print(f"--- Primary: {NAME_PRIMARY}\n--- Secondary: {NAME_SECONDARY}\n------------------------------")
    prim_acc, sec_acc, two_step_acc = TestTwoStepClassifier.run_2step_boosting(
        name_primary=NAME_PRIMARY,
        name_secondary=NAME_SECONDARY,
        batch_size=BATCH_SIZE,
        epochs_xgb=EPOCHS_XGB,
        epochs_primary=EPOCHS_PRIM,
        epochs_secondary=EPOCHS_SEC,
        train_gen_args=TRAIN_GEN_ARGS,
        reload_primary=RELOAD_PRIM,
        reload_secondary=RELOAD_SEC
    )
    print('***************************')
    print(f'prim_acc: {prim_acc}\n'
          f'sec_acc: {sec_acc}\n'
          f'two_step_acc: {two_step_acc}')
    print('***************************')


if __name__ == '__main__':
    with warnings.catch_warnings():
        warnings.simplefilter("ignore")

        # main_cnn([
        #     CnnName.VGG19.value,
        #     CnnName.INCEPTIONV3.value,
        #     CnnName.RESNET50.value,
        #     CnnName.RESNEXT50.value,
        #     CnnName.CUSTOM.value
        # ], RELOAD=True)

        # main_2_step_cnn(EPOCHS_PRIM=20, EPOCHS_SEC=20, NAME_PRIMARY=CnnName.INCEPTIONV3.value, NAME_SECONDARY=CnnName.INCEPTIONV3.value,
        #                 RELOAD_PRIM=True, RELOAD_SEC=True)

        # main_2_step_cnn(EPOCHS_PRIM=20, EPOCHS_SEC=20, NAME_PRIMARY=CnnName.RESNET50.value, NAME_SECONDARY=CnnName.RESNET50.value,
        #                 RELOAD_PRIM=True, RELOAD_SEC=False)
        #
        # main_2_step_cnn(EPOCHS_PRIM=20, EPOCHS_SEC=20, NAME_PRIMARY=CnnName.VGG19.value, NAME_SECONDARY=CnnName.VGG19.value,
        #                 RELOAD_PRIM=True, RELOAD_SEC=True)

        # main_2_step_cnn(EPOCHS_PRIM=20, EPOCHS_SEC=20, NAME_PRIMARY=CnnName.CUSTOM.value, NAME_SECONDARY=CnnName.CUSTOM.value,
        #                 RELOAD_PRIM=True, RELOAD_SEC=False)

        main_2_step_cnn(EPOCHS_PRIM=20, EPOCHS_SEC=20, NAME_PRIMARY=CnnName.RESNEXT50.value, NAME_SECONDARY=CnnName.RESNEXT50.value,
                        RELOAD_PRIM=True, RELOAD_SEC=False)

        # main_2_step_bagging(NAME_PRIMARY=CnnName.RESNEXT50.value, NAME_SECONDARY=CnnName.VGG19.value, N_EST=3,
        #                     TRAIN_GEN_ARGS=TRAIN_ARGS_DEFAULT, RELOAD_PRIM=True, RELOAD_SEC=False)
