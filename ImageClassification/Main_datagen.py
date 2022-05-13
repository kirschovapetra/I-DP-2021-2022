from classes.utils.Datasets import Datasets

if __name__ == '__main__':
    # generate extension for vega_primary dataset - 300 images per special symbol class
    Datasets.generate_dataset(source_path="datasets/vega/00_generated/vega_secondary_original",
                              dest_path="datasets/vega/00_generated/vega_primary_1000",
                              images_per_class=300, join_main_classes=True)

    # generate vega_merged dataset - 1500 images per special symbol class
    Datasets.generate_dataset(source_path="datasets/vega/00_generated/vega_secondary_original",
                              dest_path="datasets/vega/00_generated/vega_merged_1500",
                              images_per_class=1500, join_main_classes=False)

    print("\nDONE")
