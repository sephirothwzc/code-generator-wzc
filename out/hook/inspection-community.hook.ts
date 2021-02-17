import * as _ from 'lodash';
import { provide } from 'midway';
import { Transaction } from 'sequelize/types';
import { INSPECTION_COMMUNITY, InspectionCommunityModel } from '../models/inspection-community.model';
import {
  InspectionCommunityModel,
  INSPECTION_COMMUNITY,
} from '../models/inspection-community.model';
import {
  InspectionCommunityModel,
  INSPECTION_COMMUNITY,
} from '../models/inspection-community.model';
import * as Bb from 'bluebird';

@provide('InspectionCommunityHook')
export class InspectionCommunityHook {

  async beforeBulkDestroy(model: { where: {id: string}; transaction: Transaction }) {
    const { inspectionCommunityImgIbfk1, inspectionCommunityItemIbfk1 } = await Bb.props({
        inspectionCommunityImgIbfk1: InspectionCommunityImgModel.findOne({
          where: {
            [INSPECTION_COMMUNITY_IMG.INSPECTION_COMMUNITY_ID]: _.get(model, 'where.id'),
          },
        }),
        inspectionCommunityItemIbfk1: InspectionCommunityItemModel.findOne({
          where: {
            [INSPECTION_COMMUNITY_ITEM.INSPECTION_COMMUNITY_ID]: _.get(model, 'where.id'),
          },
        }),
    });
    if (inspectionCommunityImgIbfk1 || inspectionCommunityItemIbfk1) {
      throw new Error('已使用数据禁止删除');
    }
  }


}
