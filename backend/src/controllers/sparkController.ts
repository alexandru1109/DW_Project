import { Request, Response } from 'express';
import { exec } from 'child_process';
import path from 'path';

export const runSparkBatch = (req: Request, res: Response): void => {
    // Assuming the Python environment and PySpark are configured correctly locally
    // Adjust the path to the Python executable if necessary (e.g., 'python3' or path to a venv)
    const pythonExecutable = 'python'; 
    const scriptPath = path.resolve(__dirname, '../../../../lstm_network/training/spark_batch.py');
    
    console.log(`Triggering Spark Batch Job: ${pythonExecutable} ${scriptPath}`);

    exec(`${pythonExecutable} "${scriptPath}"`, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error executing Spark job: ${error.message}`);
            res.status(500).json({ error: 'Failed to run Spark job', details: error.message, stderr });
            return;
        }
        
        console.log(`Spark job stdout: ${stdout}`);
        if (stderr) {
            console.warn(`Spark job stderr: ${stderr}`);
        }

        res.status(200).json({
            message: 'Spark batch processing completed successfully',
            output: stdout
        });
    });
};
