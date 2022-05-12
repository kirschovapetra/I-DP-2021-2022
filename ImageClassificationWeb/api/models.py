from django.contrib.contenttypes.fields import GenericForeignKey, GenericRelation
from django.contrib.contenttypes.models import ContentType
from django.db import models


class AbstractModel(models.Model):
    """ Abstract class representing ML model in database """

    class Meta:
        abstract = True

    title = models.CharField(max_length=50, null=False, help_text='CNN model title')
    name = models.CharField(max_length=50, help_text='CNN model name')
    name_full = models.CharField(max_length=100, primary_key=True, help_text='CNN model full name')

    @classmethod
    def get(cls, name_full):
        return cls.objects.get(name_full=name_full)

    @classmethod
    def drop(cls):
        cls.objects.all().delete()

    @classmethod
    def filter(cls, filters):
        return cls.objects.filter(**filters)

    @classmethod
    def get_all(cls):
        return cls.objects.all()

    @classmethod
    def get_all_values(cls):
        return cls.objects.all().values()

    @classmethod
    def get_full_names(cls):
        return cls.objects.values_list('name_full', flat=True).distinct()

    @classmethod
    def update_or_create_multiple(cls, model_list):

        models_result = []
        for mdl in model_list:
            obj, created = cls.update_or_create(mdl)
            models_result.append(obj)

        return models_result

    @classmethod
    def get_titles_distinct(cls):
        titles = cls.objects.values_list('title', flat=True).distinct()
        # titles_split = []
        # for t in titles:
        #     titles_split += t.split("_")
        return [{'title': val} for val in list(set(titles))]

    @classmethod
    def update_or_create(cls, mdl):
        return None, None


class BaseModel(AbstractModel):
    """ Abstract class representing basic model with filename field """

    class Meta:
        abstract = True

    filename = models.CharField(max_length=100, null=False, help_text='CNN model filename')

    def __str__(self):
        return f"name_full={self.name_full}, title={self.title}, name={self.name}, filename={self.filename}"

    @classmethod
    def update_or_create(cls, mdl):
        return cls.objects.update_or_create(
            title=mdl.title,
            name=mdl.title.lower(),
            name_full=mdl.title.lower(),
            filename=mdl.filename
        )


class CnnModel(BaseModel):
    """ CNN classifier model """

    class Meta:
        db_table = "cnnmodel"


class BoostingModel(BaseModel):
    """ Boosting classifier model """

    class Meta:
        db_table = "boostingmodel"


class BaggingModel(AbstractModel):
    """ Bagging classifier model """

    class Meta:
        db_table = "baggingmodel"

    n_estimators = models.IntegerField(null=False, help_text='Number of estimators')
    base_dir = models.CharField(max_length=100, null=False, help_text='Ensemble model base dir')

    def __str__(self):
        return f"name_full={self.name_full}, title={self.title}, name={self.name}, n_estimators={self.n_estimators}, base_dir={self.base_dir}"

    @classmethod
    def get_titles_distinct(cls):
        titles = cls.objects.values_list('title', flat=True).distinct()
        titles_split = []
        for t in titles:
            titles_split += t.split("_")
        return [{'title': val} for val in list(set(titles_split))]

    @classmethod
    def update_or_create(cls, mdl):
        return cls.objects.update_or_create(
            title=mdl.title,
            name=mdl.title.lower(),
            name_full=f"{mdl.title.lower()}_{mdl.n_estimators}",
            n_estimators=mdl.n_estimators,
            base_dir=mdl.base_dir
        )


class StackingModel(AbstractModel):
    """ Stacking classifier model """

    class Meta:
        db_table = "stackingmodel"

    n_folds = models.IntegerField(null=False, help_text='Number of folds')
    base_dir = models.CharField(max_length=100, null=True, help_text='Ensemble model base dir')
    base_title = models.CharField(max_length=100, null=True, help_text='Ensemble model base title')

    def __str__(self):
        return f"name_full={self.name_full}, title={self.title}, name={self.name}, base_dir={self.base_dir}, base_title={self.base_title}, n_folds={self.n_folds}"

    @classmethod
    def get_titles_distinct(cls):
        titles = cls.objects.values_list('title', flat=True).distinct()
        titles_split = []
        for t in titles:
            titles_split += t.split("_")
        return [{'title': val} for val in list(set(titles_split))]

    @classmethod
    def update_or_create(cls, mdl):
        return cls.objects.update_or_create(
            title=mdl.title,
            name=mdl.title.lower(),
            n_folds=mdl.n_folds,
            base_dir=mdl.base_dir,
            base_title=mdl.base_title,
            name_full=mdl.title.lower()
        )


class TwoStepModel(AbstractModel):
    """ Two-step classifier model """

    class Meta:
        db_table = 'twostepmodel'
    base_dir = models.CharField(max_length=100, null=True, help_text='Primary model full name')
    primary_method = models.CharField(max_length=100, null=True, help_text='Primary model full name')
    primary_name_full = models.CharField(max_length=100, null=True, help_text='Primary model full name')

    def __str__(self):
        return f"name_full={self.name_full}, title={self.title}, name={self.name}, base_dir={self.base_dir}, primary_method={self.primary_method}, primary_name_full={self.primary_name_full}"

    @classmethod
    def drop(cls):
        cls.objects.all().delete()

    @classmethod
    def update_or_create(cls, mdl):
        return cls.objects.update_or_create(
            title=mdl.title,
            name=mdl.title.lower(),
            name_full=f"{mdl.primary_method}+{mdl.primary_name_full}+{mdl.title.lower()}",
            base_dir=mdl.base_dir,
            primary_method=mdl.primary_method,
            primary_name_full=mdl.primary_name_full,
        )
