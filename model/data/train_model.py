from azureml.core import Workspace, Dataset, Experiment
from azureml.train.automl import AutoMLConfig
import os

ws = Workspace.from_config()  # Make sure your config file is in the correct path

# Example of how to create a dataset and run AutoML
datastore = ws.get_default_datastore()
dataset = Dataset.Tabular.from_delimited_files(path=(datastore, 'data/aapl_historical_data.csv'))

automl_config = AutoMLConfig(
    task='regression',
    primary_metric='normalized_root_mean_squared_error',
    training_data=dataset,
    label_column_name='close',
    n_cross_validations=5,
    enable_early_stopping=True
)

experiment = Experiment(ws, 'automl-stock-prediction')
run = experiment.submit(automl_config, show_output=True)

best_run, fitted_model = run.get_output()
print(best_run)
print(fitted_model)
