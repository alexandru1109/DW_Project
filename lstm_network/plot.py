import matplotlib.pyplot as plt

def plot_results(real_data, predictions, title='Stock Price Prediction'):
    plt.figure(figsize=(10.24, 8.74))  # Size in inches to meet specific size requirements
    plt.plot(real_data, label='Actual Stock Price')
    plt.plot(len(real_data), predictions[-1], 'ro', label='Predicted Next Close Price')
    plt.title(title)
    plt.xlabel('Time')
    plt.ylabel('Stock Price')
    plt.legend()
    plt.savefig('plot.png')  # Save the plot image file
    plt.show()
