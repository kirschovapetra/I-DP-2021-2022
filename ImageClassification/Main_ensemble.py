from classes.test.TestEnsemble import TestEnsemble
from classes.utils.Constants import CnnName, Dataset, TRAIN_ARGS_DEFAULT
from general import *


def stacking(BATCH_SIZE=100, EPOCHS=20, N_FOLDS=3, TRAIN_GEN_ARGS=TRAIN_ARGS_DEFAULT, DATASET=Dataset.VEGA_PRIMARY.value, reload=False):
    print("----------------------- STACKING ------------------------------")

    # comb2 = list(combinations_with_replacement([CnnName.CUSTOM.value, CnnName.VGG19.value, CnnName.RESNET50.value], 2))
    # comb3 = list(combinations_with_replacement([CnnName.CUSTOM.value, CnnName.VGG19.value, CnnName.RESNET50.value], 3))

    for names in [
        [CnnName.RESNET50.value, CnnName.RESNET50.value],
        [CnnName.CUSTOM.value, CnnName.RESNET50.value, CnnName.VGG19.value]
    ]:

        try:
            print(f"--- Dataset: {DATASET}\n--- Names: {names}")
            TestEnsemble.run_stacking(names=list(names), n_folds=N_FOLDS, epochs=EPOCHS, batch_size=BATCH_SIZE,
                                      dataset=DATASET, reload=reload, train_gen_args=TRAIN_GEN_ARGS)
        except Exception as e:
            print(str(e))
            continue


def bagging(NAMES, DATASET=Dataset.VEGA_PRIMARY.value, BATCH_SIZE=100, EPOCHS=20, N_EST=3, TRAIN_GEN_ARGS=TRAIN_ARGS_DEFAULT, reload=False):
    print("----------------------- BAGGING ------------------------------")

    acc_dict = {}
    for name in NAMES:
        print(f"--- Dataset: {DATASET}\n--- Name: {name}")
        acc, _ = TestEnsemble.run_bagging(name=name, n_estimators=N_EST, epochs=EPOCHS, batch_size=BATCH_SIZE,
                                          dataset=DATASET, reload=reload, train_gen_args=TRAIN_GEN_ARGS)
        acc_dict[name] = acc
    print('*******************************************************************************************************************************')
    print(DATASET)
    for x in acc_dict.keys():
        print(x, acc_dict[x])
    print('*******************************************************************************************************************************')


def boosting(NAMES, DATASETS, BATCH_SIZE=100, EPOCHS_CNN=20, EPOCHS_XGBOOST=50, TRAIN_GEN_ARGS=TRAIN_ARGS_DEFAULT, reload=False):
    print("----------------------- BOOSTING ------------------------------")

    for dataset in DATASETS:
        acc_dict = {}
        for name in NAMES:
            print(f"--- Dataset: {dataset}\n--- Name: {name}")
            acc, _ = TestEnsemble.run_boosting(dataset=dataset, name=name, epochs_cnn=EPOCHS_CNN, epochs_xgboost=EPOCHS_XGBOOST,
                                               batch_size=BATCH_SIZE, reload=reload, train_gen_args=TRAIN_GEN_ARGS)
            acc_dict[name] = acc * 100
        print('*******************************************************************************************************************************')
        print(dataset)
        for x in acc_dict.keys():
            print(x, acc_dict[x])
        print('*******************************************************************************************************************************')


if __name__ == '__main__':
    with warnings.catch_warnings():
        warnings.simplefilter("ignore")

        bagging(NAMES=[x.value for x in CnnName], DATASET=Dataset.VEGA_PRIMARY.value, reload=True)
        boosting(NAMES=[x.value for x in CnnName], DATASETS=[Dataset.VEGA_PRIMARY.value], reload=True)
        stacking(DATASET=Dataset.VEGA_PRIMARY.value, reload=True)
