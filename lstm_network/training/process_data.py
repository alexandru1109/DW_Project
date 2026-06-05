from sklearn.preprocessing import MinMaxScaler
import numpy as np

def process_data(df, feature='Close', time_step=60):
    scaler = MinMaxScaler(feature_range=(0, 1))
    scaled_data = scaler.fit_transform(df[feature].values.reshape(-1,1))

    X, Y = [], []
    for i in range(len(scaled_data) - time_step - 1):
        a = scaled_data[i:(i + time_step), 0]
        X.append(a)
        Y.append(scaled_data[i + time_step, 0])

    X = np.array(X).reshape(-1, time_step, 1)
    Y = np.array(Y)
    return X, Y, scaler