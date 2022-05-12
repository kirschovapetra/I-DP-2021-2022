import os.path
import re
import shutil
import splitfolders
from imageio import imread
from classes.utils.Constants import Dataset, TRAIN_ARGS_DEFAULT
from classes.utils.Constants import LABELS_MERGED_GEN
from classes.utils.Utils import Utils
from general import *


class Datasets:
    """ Various dataset-related methods """

    @staticmethod
    def load_df(root_dir: str) -> pd.DataFrame:
        """
        Create dataframe from directory

        :param root_dir: oot directory path
        :return:
            * df: loaded dataset pd.DataFrame{"filename": filenames, "class": classes}

        """

        filenames = []
        classes = []

        for class_name in sorted(os.listdir(root_dir)):
            subdir = os.path.join(root_dir, class_name)
            for file in sorted(os.listdir(subdir)):
                filenames.append(os.path.join(subdir, file))
                classes.append(class_name)

        df = pd.DataFrame({"filename": filenames, "class": classes})

        return df

    @staticmethod
    def load_split_df(**kwargs) -> pd.DataFrame:
        """
        Create train, test, val dataframe from multiple directories

        :param kwargs:
            * train_dir: name of training data directory
            * test_dir: name of testing data directory
            * val_dir: name of validation data directory

        :return:
            * train_df: loaded train dataset pd.DataFrame{"filename": filenames, "class": classes}
            * test_df: loaded test dataset pd.DataFrame{"filename": filenames, "class": classes}
            * val_df: loaded validation dataset pd.DataFrame{"filename": filenames, "class": classes}
        """

        train_df, test_df, val_df = None, None, None

        if kwargs.get('train_dir') is not None:
            train_df = Datasets.load_df(kwargs.get('train_dir'))
        if kwargs.get('test_dir') is not None:
            test_df = Datasets.load_df(kwargs.get('test_dir'))
        if kwargs.get('val_dir') is not None:
            val_df = Datasets.load_df(kwargs.get('val_dir'))

        return train_df, test_df, val_df

    @staticmethod
    def split(partitions: int, root_dir: str, train_size: float) -> any:
        """
        Split dataframe into partitions

        :param partitions: number of partitions to be created
        :param root_dir: root directory path
        :param train_size: size of training set
        :return:
            * train_df (opt.): training dataset pd.DataFrame {"filename": filenames, "class": classes}
            * test_df (opt.): test dataset pd.DataFrame {"filename": filenames, "class": classes}
            * val_df (opt.): validation dataset pd.DataFrame {"filename": filenames, "class": classes}

        """

        if partitions == 3:
            df = Datasets.load_df(root_dir)
            train_df, test_val_df = model_selection.train_test_split(df, train_size=train_size, shuffle=True, random_state=123)
            val_df, test_df = model_selection.train_test_split(test_val_df, train_size=0.5, shuffle=True, random_state=123)
            return train_df, test_df, val_df
        elif partitions == 2:
            df = Datasets.load_df(root_dir)
            train_df, test_df = model_selection.train_test_split(df, train_size=train_size, shuffle=True, random_state=123)
            return train_df, test_df
        else:
            return None

    @staticmethod
    def get_iterators_from_df(img_size: tuple, batch_size: int, dataset: str = Dataset.VEGA_PRIMARY.value, train_gen_args: dict = TRAIN_ARGS_DEFAULT,
                              reload: bool = False, save_sample: bool = False, **kwargs) -> Tuple[DataFrameIterator, DataFrameIterator, DataFrameIterator]:
        """
        Get data frame iterators from dataframe

        :param img_size: image size (height, width)
        :param batch_size: batch size
        :param dataset: dataset name
        :param train_gen_args: training ImagaDataGenerator arguments
        :param reload: reload from file
        :param save_sample: save augmented images from data iterator to dir
        :param kwargs:
            * train_df: training dataset
            * test_df: testing dataset
            * val_df: validation dataset

        :return:
            * train_iter (opt.): training iterator
            * test_iter (opt.): testing iterator
            * val_iter (opt.): validation iterator
        """

        if train_gen_args is None: train_gen_args = {}
        flow_args = {"target_size": img_size, "batch_size": batch_size, "x_col": 'filename', "y_col": 'class'}

        idg_train = ImageDataGenerator(rescale=1.0 / 255.0, **train_gen_args)
        idg_test_val = ImageDataGenerator(rescale=1.0 / 255.0)

        train_iter, test_iter, val_iter = Datasets._get_iterators_core(
            dataset=dataset,
            save_sample=save_sample,
            reload=reload,
            kwargs_suffix="df",
            train_gen_args=train_gen_args, flow_args=flow_args,
            train_flow_fun=idg_train.flow_from_dataframe,
            test_val_flow_fun=idg_test_val.flow_from_dataframe, **kwargs
        )

        return train_iter, test_iter, val_iter

    @staticmethod
    def get_iterators_from_dir(img_size: tuple, batch_size: int, dataset: str = Dataset.VEGA_PRIMARY.value, train_gen_args: dict = TRAIN_ARGS_DEFAULT,
                               reload: bool = False, save_sample: bool = False, **kwargs):
        """
        Get data frame iterators from directory

        :param img_size: image size (height, width)
        :param batch_size: batch size
        :param dataset: dataset name
        :param train_gen_args: training ImagaDataGenerator arguments
        :param reload: reload from file
        :param save_sample:save augmented images from data iterator to dir
        :param kwargs: (opt.)
            * train_path: path to training dataset directory
            * test_path: path to testing dataset directory
            * val_path: path to validation dataset directory
            * validation_split: size of validation dataset

        :return:
            * train_iter (opt.): training iterator
            * test_iter (opt.): testing iterator
            * val_iter (opt.): validation iterator

        """
        if train_gen_args is None: train_gen_args = {}
        val_split = kwargs.get("validation_split")
        flow_args = {"target_size": img_size, "batch_size": batch_size}

        idg_train = ImageDataGenerator(rescale=1.0 / 255.0, **train_gen_args)
        idg_test_val = ImageDataGenerator(rescale=1.0 / 255.0)
        idg_train_split = None if val_split is None else ImageDataGenerator(rescale=1.0 / 255.0, validation_split=val_split, **train_gen_args)
        idg_val_split = None if val_split is None else ImageDataGenerator(rescale=1.0 / 255.0, validation_split=val_split)

        train_iter, test_iter, val_iter = Datasets._get_iterators_core(
            dataset=dataset,
            save_sample=save_sample,
            reload=reload,
            kwargs_suffix="path",
            train_gen_args=train_gen_args,
            flow_args=flow_args,
            train_flow_fun=idg_train.flow_from_directory,
            test_val_flow_fun=idg_test_val.flow_from_directory,
            train_split_flow_fun=idg_train_split.flow_from_directory,
            val_split_flow_fun=idg_val_split.flow_from_directory,
            **kwargs
        )

        return train_iter, test_iter, val_iter

    @staticmethod
    def _get_iterators_core(dataset: str, save_sample: bool, reload: bool, kwargs_suffix: str = None, train_gen_args: dict = TRAIN_ARGS_DEFAULT,
                            flow_args: dict = None, train_flow_fun: Callable = None, test_val_flow_fun: Callable = None,
                            train_split_flow_fun: Callable = None, val_split_flow_fun: Callable = None, **kwargs) -> any:
        """
         Get data frame iterators from directory - core function

        :param dataset: dataset name
        :param save_sample:save augmented images from data iterator to dir
        :param reload: reload from file
        :param kwargs_suffix: 'df' or 'path'
        :param train_gen_args: training ImagaDataGenerator arguments
        :param flow_args: flow arguments
        :param train_flow_fun: flow_from_directory or flow_from_dataframe
        :param test_val_flow_fun: flow_from_directory or flow_from_dataframe
        :param train_split_flow_fun: flow_from_directory or flow_from_dataframe
        :param val_split_flow_fun: flow_from_directory or flow_from_dataframe
        :param kwargs:
            * train_path: (opt.) path to training dataset directory
            * test_path: (opt.) path to testing dataset directory
            * val_path: (opt.) path to validation dataset directory
            * validation_split: (opt.) size of validation dataset
            * train_df: (opt.) training dataset
            * test_df: (opt.) testing dataset
            * val_df: (opt.) validation dataset

        :return:
            * train_iter (opt.): training iterator
            * test_iter (opt.): testing iterator
            * val_iter (opt.): validation iterator
        """

        test_arg = kwargs.get(f"test_{kwargs_suffix}")
        train_arg = kwargs.get(f"train_{kwargs_suffix}")
        val_arg = kwargs.get(f"val_{kwargs_suffix}")
        val_split = kwargs.get("validation_split")

        if save_sample and not reload:
            class_dir = Datasets.init_sample_dir(root_dir=f'{PROJECT_ROOT}/tmp/samples/{dataset}',
                                                 dir_name="TRAIN-" + "-".join(train_gen_args.keys()))
            sample_args = flow_args.copy()
            sample_args['batch_size'] = 1

            sample_iter = train_flow_fun(train_arg, **sample_args)
            sleep(0.01)
            for i in tqdm(range(50)):
                Datasets.save_first_img_from_batch(data_iter=sample_iter, class_dir=class_dir, reset=False)
                sample_iter.reset()

        # get all iterators
        if test_arg is not None and train_arg is not None and val_arg is not None:
            train_iter = train_flow_fun(train_arg, **flow_args)
            test_iter = test_val_flow_fun(test_arg, shuffle=False, **flow_args)
            val_iter = test_val_flow_fun(val_arg, **flow_args)
            return train_iter, test_iter, val_iter

        if test_arg is not None and train_arg is not None and val_split is not None:
            # train + val use the same seed
            train_iter = train_split_flow_fun(train_arg, seed=1, subset='training', **flow_args)
            val_iter = val_split_flow_fun(train_arg, seed=1, subset='validation', **flow_args)
            test_iter = test_val_flow_fun(test_arg, shuffle=False, **flow_args)
            return train_iter, test_iter, val_iter

        # get only test iterator
        if test_arg is not None:
            test_iter = test_val_flow_fun(test_arg, shuffle=False, **flow_args)
            return None, test_iter, None

        # get only train and val iterator
        if train_arg is not None and val_arg is not None:
            train_iter = train_flow_fun(train_arg, **flow_args)
            val_iter = test_val_flow_fun(val_arg, **flow_args)
            return train_iter, None, val_iter

    @staticmethod
    def save_first_img_from_batch(data_iter: DataFrameIterator, class_dir: str, reset: bool = False):
        """
        Save single batch

        :param data_iter: image iterator
        :param class_dir: root directory
        :param reset: reset dataset
        """

        batch = next(data_iter)
        img_from_batch = batch[0][0]

        if img_from_batch[0][0][0] <= 1.0:
            img_from_batch *= 255.

        img = image.array_to_img(img_from_batch, scale=False)
        index_array, img_paths = Datasets._get_files_from_batch(data_iter)
        fname = f'aug_{index_array[0]}_{np.random.randint(1e7)}.jpg'

        dst_path_full = os.path.join(class_dir, fname)
        img.save(dst_path_full)
        if reset:
            data_iter.reset()

    @staticmethod
    def _get_files_from_batch(data_iter: DataFrameIterator) -> Tuple[list, list]:
        """
        Load images from single batch

        Source: https://stackoverflow.com/questions/41715025/keras-flowfromdirectory-get-file-names-as-they-are-being-generated

        :param data_iter: image iterator
        :return:
            * index_array - ist of indexes
            * img_paths - list of image paths
        """

        BATCH_IDX = data_iter.batch_index
        BATCH_SIZE = data_iter.batch_size
        N_SAMPLES = data_iter.samples

        current_idx = ((BATCH_IDX - 1) * BATCH_SIZE)
        if current_idx < 0:
            if N_SAMPLES % BATCH_SIZE > 0:
                current_idx = max(0, N_SAMPLES - N_SAMPLES % BATCH_SIZE)
            else:
                current_idx = max(0, N_SAMPLES - BATCH_SIZE)

        index_array = data_iter.index_array[current_idx:current_idx + BATCH_SIZE].tolist()
        img_paths = [data_iter.filepaths[idx] for idx in index_array]

        return index_array, img_paths

    @staticmethod
    def iterator_to_numpy(data_iter: DataFrameIterator) -> Tuple[np.array, np.array]:
        """
        Convert DataFrameIterator to numpy array

        :param data_iter: image iterator
        :return:
            * images: list of images (num of images x height x width x channels)
            * labels: list of labels
        """

        images = []
        labels = []
        data_iter.reset()
        sleep(0.01)
        for i in tqdm(range(data_iter.__len__())):
            a, b = data_iter.next()
            images.append(a)
            labels.append(b)
        images = np.array(images)
        labels = np.array(labels)
        data_iter.reset()
        return images, labels

    @staticmethod
    def load_ensemble_df(dataset: str, train_size: float, weights_dir: str, method: str):
        """
        Load dataset for ensemble

        :param dataset: dataset name
        :param train_size: size of training set
        :param method: ensemble method
        :param weights_dir: name of directory
        :return:
            * train_df: training dataset
            * test_df: testing dataset
            * out_dir - name of directory where to store trained weights
        """

        Utils.validate_dataset(dataset)

        train_df, test_df = None, None

        if dataset == Dataset.DIDA.value:
            train_df, test_df = Datasets.split(2, "datasets/dida_10000", train_size=train_size)
        elif dataset == Dataset.MNIST.value:
            train_df, test_df, _ = Datasets.load_split_df(train_dir="datasets/mnist/train", test_dir='datasets/mnist/test')
            train_df, _ = model_selection.train_test_split(train_df, train_size=0.3, shuffle=True, random_state=123)
            test_df, _ = model_selection.train_test_split(test_df, train_size=0.3, shuffle=True, random_state=123)
        elif dataset == Dataset.VEGA_PRIMARY.value:
            train_df, test_df = Datasets.split(2, "datasets/vega/vega_primary", train_size=train_size)
        elif dataset == Dataset.VEGA_MERGED.value:
            train_df, test_df = Datasets.split(2, "datasets/vega/vega_merged", train_size=train_size)

        out_dir = os.path.join(weights_dir, dataset, method)

        return train_df, test_df, out_dir

    @staticmethod
    def load_dataset_df(dataset: str, train_size: float = 0.7, label_id: str = None):
        """
        Load data iterators

        :param label_id: label
        :param dataset: dataset name
        :param train_size: size of training set
        :return:
            * train_df: training dataframe
            * test_df: testing dataframe
            * val_df: validation dataframe
        """

        Utils.validate_dataset(dataset)

        if dataset == Dataset.VEGA_PRIMARY.value:
            path = "datasets/vega/vega_primary"
            train_df, test_df, val_df = Datasets.split(3, path, train_size=train_size)
        elif dataset == Dataset.VEGA_PRIMARY_SPLIT.value:
            path = "datasets/vega/vega_primary_split"
            train_df, test_val_df, _ = Datasets.load_split_df(train_dir=os.path.join(path, 'train'), test_dir=os.path.join(path, 'test_val'))
            test_df, val_df = model_selection.train_test_split(test_val_df, train_size=0.5, shuffle=True, random_state=123)
        elif dataset == Dataset.VEGA_PRIMARY_SPLIT_DEN.value:
            path = "datasets/vega/vega_primary_split_den"
            train_df, test_val_df, _ = Datasets.load_split_df(train_dir=os.path.join(path, 'train'), test_dir=os.path.join(path, 'test_val'))
            test_df, val_df = model_selection.train_test_split(test_val_df, train_size=0.5, shuffle=True, random_state=123)
        elif dataset == Dataset.VEGA_PRIMARY_SPLIT_THR.value:
            path = "datasets/vega/vega_primary_split_thr"
            train_df, test_val_df, _ = Datasets.load_split_df(train_dir=os.path.join(path, 'train'), test_dir=os.path.join(path, 'test_val'))
            test_df, val_df = model_selection.train_test_split(test_val_df, train_size=0.5, shuffle=True, random_state=123)
        elif dataset == Dataset.VEGA_MERGED.value:
            path = "datasets/vega/vega_merged"
            train_df, test_df, val_df = Datasets.split(3, path, train_size=train_size)
        elif dataset == Dataset.VEGA_SECONDARY.value:
            root_path = "datasets/vega/vega_secondary"
            if label_id is None:
                raise Exception("Invalid label_id")
            path = os.path.join(root_path, str(label_id))
            train_df, test_df, val_df = Datasets.split(3, path, train_size=train_size)
        elif dataset == Dataset.DIDA.value:
            path = "datasets/dida_10000"
            train_df, test_df, val_df = Datasets.split(3, path, train_size=train_size)
        else:
            raise Exception("Invalid dataset name")

        return train_df, test_df, val_df

    @staticmethod
    def load_dataset_iter(dataset: str, train_size: float, img_size, batch_size: int, train_gen_args: dict = TRAIN_ARGS_DEFAULT,
                          reload: bool = False, save_sample: bool = False, label_id: str = None):
        """
        Load data iterators

        :param label_id: label
        :param dataset: dataset name
        :param train_size: size of training set
        :param img_size:image size (32, 32)
        :param batch_size:batch size
        :param train_gen_args: training ImagaDataGenerator arguments
        :param reload: reload from file
        :param save_sample: whether to save sample of input images
        :return:
            * train_iter: training iterator
            * test_iter: testing iterator
            * val_iter: validation iterator
        """
        if dataset == Dataset.MNIST.value:
            return Datasets.get_iterators_from_dir(
                img_size=img_size,
                batch_size=batch_size,
                train_gen_args=train_gen_args,
                reload=reload,
                save_sample=save_sample,
                train_path="datasets/mnist/train/",
                test_path="datasets/mnist/test/",
                validation_split=1.0 - train_size
            )

        train_df, test_df, val_df = Datasets.load_dataset_df(dataset, train_size, label_id)

        train_iter, test_iter, val_iter = Datasets.get_iterators_from_df(
            img_size=img_size,
            batch_size=batch_size,
            train_gen_args=train_gen_args,
            reload=reload,
            save_sample=save_sample,
            train_df=train_df,
            test_df=test_df,
            val_df=val_df
        )

        return train_iter, test_iter, val_iter

    @staticmethod
    def init_sample_dir(root_dir: str, dir_name: str = None, skip_folder_regex: str = r"^$") -> str:
        """
        Initialize directory for sample images

        :param root_dir: root directory name
        :param dir_name: subdirectory name
        :param skip_folder_regex: regex for directories to skip
        :return:
            * path: sample directory path
        """

        path = root_dir if dir_name is None else os.path.join(root_dir, dir_name)

        if not os.path.exists(path):
            os.makedirs(path)

        for name in os.listdir(path):
            file_path = os.path.join(path, name)

            if os.path.isfile(file_path) or os.path.islink(file_path):
                os.unlink(file_path)
            elif os.path.isdir(file_path):
                contents = os.listdir(file_path)
                for contents_name in contents:
                    contents_path = os.path.join(file_path, contents_name)
                    try:
                        if not bool(re.match(skip_folder_regex, contents_name)):
                            shutil.rmtree(contents_path)
                    except Exception as e:
                        print(e)

        return path

    @staticmethod
    def rename_all(source_path, dest_path, suffix):
        """
        Rename all images inside directory
        :param source_path: source directory
        :param dest_path: destination directory
        :param suffix: suffix to append after image name
        """

        for class_name in sorted(os.listdir(source_path)):
            subdir = os.path.join(source_path, class_name)
            for count, filename in enumerate(os.listdir(subdir)):
                # init path
                original_path = os.path.join(source_path, class_name, filename)
                new_path_dir = os.path.join(dest_path, class_name)
                if not os.path.exists(new_path_dir):
                    os.makedirs(new_path_dir)

                # create new file name
                name = filename.split('.')[0]
                ext = filename.split('.')[1]
                new_path = os.path.join(new_path_dir, f"{name}_{suffix}.{ext}")
                # rename and save image to new_path
                os.rename(original_path, new_path)

    @staticmethod
    def generate_dataset(source_path, dest_path, images_per_class, join_main_classes=False):
        """
        Generate dataset with ImageDataGenerator

        Source: https://stackoverflow.com/questions/47826730/how-to-save-resized-images-using-imagedata_itererator-and-flow-from-directory-in-k

        :param source_path: source directory
        :param dest_path: destination directory
        :param images_per_class: number of images to generate per class
        :param join_main_classes: join images into main classes
        """

        LABELS = list(LABELS_MERGED_GEN.keys())

        data_df = Datasets.load_df(source_path)
        idg = ImageDataGenerator(
            rotation_range=30,
            height_shift_range=0.07,
            width_shift_range=0.07,
            zoom_range=0.25,
            brightness_range=(0.4, 0.9),
            channel_shift_range=50
        )

        dest_path = Datasets.init_sample_dir(dest_path, skip_folder_regex=r'^\d$')

        for label in LABELS:
            print(f"------------------------ {label} ----------------------------")

            base_label = label.split("^")[0] if '^' in label else label.split("-")[0] if '-' in label else label
            if join_main_classes:
                class_dir = os.path.join(dest_path, base_label)
            else:
                class_dir = os.path.join(dest_path, base_label, label)

            if not os.path.exists(class_dir):
                os.makedirs(class_dir)

            data_iter = idg.flow_from_dataframe(data_df, x_col='filename', y_col='class', batch_size=1, target_size=(100, 60), classes=[label])
            n = data_iter.__len__()

            if n == 0: continue

            sleep(0.01)
            for i in tqdm(range(images_per_class // n + 1)):
                for j in range(n):
                    Datasets.save_first_img_from_batch(data_iter=data_iter, class_dir=class_dir, reset=False)
                data_iter.reset()

    @staticmethod
    def generate_sample_dataset(source_path, dest_path):
        """
        Generate sample dataset with ImageDataGenerator
        :param source_path: source directory
        :param dest_path: destination directory
        """

        idg = ImageDataGenerator(
            rotation_range=40,
            height_shift_range=0.1,
            width_shift_range=0.1,
            zoom_range=0.25
        )
        data_iter = idg.flow_from_directory(source_path, batch_size=1, target_size=(100, 60))

        dest_path = Datasets.init_sample_dir(dest_path)
        sleep(0.01)
        for i in range(500):
            Datasets.save_first_img_from_batch(data_iter=data_iter, class_dir=dest_path, reset=False)
            data_iter.reset()

    @staticmethod
    def split_dataset(source_path, dest_path, train_size):
        """
        Split dataset into two folders

        :param source_path: source directory
        :param dest_path: destination directory
        :param train_size: train dataset size
        """
        splitfolders.ratio(
            input=source_path,
            output=dest_path,
            seed=123,
            ratio=(train_size, 1.0 - train_size),
            group_prefix=None,
            move=False
        )

    @staticmethod
    def denoise_all(source_path, dest_path):
        """
        Generate dataset with denoised images

        :param source_path: source directory
        :param dest_path: destination directory
        """

        Datasets.init_sample_dir(dest_path)

        for class_name in sorted(os.listdir(source_path)):
            subdir = os.path.join(source_path, class_name)
            sleep(0.01)
            print(f'-------------------{class_name}---------------------')
            sleep(0.01)
            for img_filename in tqdm(os.listdir(subdir)):
                img_orig = imread(os.path.join(source_path, class_name, img_filename))
                img_den = Utils.denoise(img_orig)
                if img_den[0][0][0] <= 1.0:
                    img_den *= 255.
                img_den = image.array_to_img(img_den, scale=False)
                dest_path = os.path.join(dest_path, class_name)
                if not os.path.exists(dest_path):
                    os.makedirs(dest_path)
                img_den.save(os.path.join(dest_path, f'den_{img_filename}.jpg'))

    @staticmethod
    def thresh_all(source_path, dest_path):
        """
        Generate dataset with thresholded images

        :param source_path: source directory
        :param dest_path: destination directory
        """

        Datasets.init_sample_dir(dest_path)

        for class_name in sorted(os.listdir(source_path)):
            subdir = os.path.join(source_path, class_name)
            sleep(0.01)
            print(f'-------------------{class_name}---------------------')
            sleep(0.01)
            for img_filename in tqdm(os.listdir(subdir)):
                img_orig = imread(os.path.join(source_path, class_name, img_filename))
                img_den = Utils.to_otsu(img_orig)
                if img_den[0][0][0] <= 1.0:
                    img_den *= 255.
                img_den = image.array_to_img(img_den, scale=False)
                dest_path = os.path.join(dest_path, class_name)
                if not os.path.exists(dest_path):
                    os.makedirs(dest_path)
                img_den.save(os.path.join(dest_path, f'thr_{img_filename}.jpg'))
