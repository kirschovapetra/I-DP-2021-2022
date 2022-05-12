from classes.utils.Datasets import Datasets

if __name__ == '__main__':
    # generate vega_primary dataset - 300 images per special symbol class
    # Datasets.generate_dataset(source_path="datasets/vega/00_generated/vega_secondary_original",
    #                           dest_path="datasets/vega/00_generated/vega_primary_1000",
    #                           images_per_class=300, join_main_classes=True)
    # generate vega_merged dataset - 1000 images per special symbol class
    # Datasets.generate_dataset(source_path="datasets/vega/00_generated/vega_secondary_original",
    #                           dest_path="datasets/vega/00_generated/vega_merged_1000",
    #                           images_per_class=1000, join_main_classes=False)

    Datasets.generate_sample_dataset(source_path="datasets/vega/test_sample_gen",
                                     dest_path="datasets/vega/test_sample_rot_shift_zoom2")

    print("\nDONE")
