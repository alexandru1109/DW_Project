import DataSource, { IDataSource } from '../models/dataSourceModel';

export class DataSourceRepository {
  /**
   * Ensures a DataSource exists and returns it.
   */
  async getOrCreate(name: string, type: string): Promise<IDataSource> {
    let source = await DataSource.findOne({ name }).exec();
    if (!source) {
      source = new DataSource({ name, type });
      await source.save();
    }
    return source;
  }
}
