import request from '@/utils/request'

/**
 * 获取车辆记录列表
 */
export function getVehicleRecords(params) {
  return request({
    url: '/vehicle-records',
    method: 'get',
    params
  })
}

/**
 * 获取车辆记录详情
 */
export function getVehicleRecordDetail(id) {
  return request({
    url: `/vehicle-records/${id}`,
    method: 'get'
  })
}

/**
 * 获取统计信息
 */
export function getStatistics(params) {
  return request({
    url: '/vehicle-records/statistics',
    method: 'get',
    params
  })
}

/**
 * 获取快照图片URL
 */
export function getSnapshotUrl(parkingLotCode, filename) {
  return `/api/vehicle-records/snapshot/${parkingLotCode}/${filename}`
}

/**
 * 手动发起双通道支付(终端 + 在线)
 */
export function initiatePayment(id, paymentDeviceId) {
  return request({
    url: `/vehicle-records/${id}/initiate-payment`,
    method: 'post',
    params: {
      paymentDeviceId
    }
  })
}

/**
 * 发起LCD支付 - 在LCD屏幕显示支付二维码
 */
export function sendLcdPayment(id) {
  return request({
    url: `/vehicle-records/${id}/lcd-payment`,
    method: 'post'
  })
}
