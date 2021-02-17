import * as _ from 'lodash';
import { provide } from 'midway';
import { Transaction } from 'sequelize/types';
import { COMMUNITY_BUCKET, CommunityBucketModel } from '../models/community-bucket.model';
import {
  CommunityBucketModel,
  COMMUNITY_BUCKET,
} from '../models/community-bucket.model';
import {
  CommunityBucketModel,
  COMMUNITY_BUCKET,
} from '../models/community-bucket.model';
import {
  CommunityBucketModel,
  COMMUNITY_BUCKET,
} from '../models/community-bucket.model';
import * as Bb from 'bluebird';

@provide('CommunityBucketHook')
export class CommunityBucketHook {

  async beforeBulkDestroy(model: { where: {id: string}; transaction: Transaction }) {
    const { deviceCommunitybucketIbfk2, inspectionCommunityIbfk1, inspectionCommunityItemIbfk2 } = await Bb.props({
        deviceCommunitybucketIbfk2: DeviceCommunitybucketModel.findOne({
          where: {
            [DEVICE_COMMUNITYBUCKET.COMMUNITY_BUCKET_ID]: _.get(model, 'where.id'),
          },
        }),
        inspectionCommunityIbfk1: InspectionCommunityModel.findOne({
          where: {
            [INSPECTION_COMMUNITY.COMMUNITY_BUCKET_ID]: _.get(model, 'where.id'),
          },
        }),
        inspectionCommunityItemIbfk2: InspectionCommunityItemModel.findOne({
          where: {
            [INSPECTION_COMMUNITY_ITEM.COMMUNITY_BUCKET_ID]: _.get(model, 'where.id'),
          },
        }),
    });
    if (deviceCommunitybucketIbfk2 || inspectionCommunityIbfk1 || inspectionCommunityItemIbfk2) {
      throw new Error('已使用数据禁止删除');
    }
  }


  async beforeUpdate(
    model: DeviceCommunitybucketModel,
    options: { transaction: Transaction; validate: Boolean; returning: Boolean }
  ) {
    const changed = model.changed();
    if (!changed) {
      return;
    }

    if (changed.includes(COMMUNITY_BUCKET.BUCKET_CODE) && model.get('BucketCode')) {
      const item0 = await DeviceModel.findOne({
        where: {
          [COMMUNITY_BUCKET.BUCKET_CODE]: model.get('BucketCode'),
        },
        transaction: options?.transaction,
      });
      if (item0) {
        throw new Error('桶站编号[unique]已存在');
      }
    }
    
  }

  async beforeCreate(
    model: DeviceCommunitybucketModel,
    options: { transaction: Transaction; validate: Boolean; returning: Boolean }
  ) {

    if (model.get('BucketCode')) {
      const item0 = await DeviceModel.findOne({
        where: {
          [COMMUNITY_BUCKET.BUCKET_CODE]: model.get('BucketCode'),
        },
        transaction: options?.transaction,
      });
      if (item0) {
        throw new Error('桶站编号[unique]已存在');
      }
    }
    
  }
  
}
