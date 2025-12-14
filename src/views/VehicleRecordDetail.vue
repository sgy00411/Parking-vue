<template>
  <div class="vehicle-record-detail">
    <el-page-header @back="goBack" :content="$t('vehicleRecords.detailTitle')"></el-page-header>

    <el-card v-loading="loading" class="detail-card">
      <div v-if="record">
        <!-- 基本信息 -->
        <div class="section">
          <h3 class="section-title">{{ $t('vehicleRecords.basicInfo') }}</h3>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="ID">{{ record.id }}</el-descriptions-item>
            <el-descriptions-item :label="$t('vehicleRecords.parkingLotCode')">
              {{ record.parkingLotCode || '-' }}
            </el-descriptions-item>
            <el-descriptions-item :label="$t('vehicleRecords.status')">
              <el-tag v-if="record.status === 'entered'" type="success">{{ $t('vehicleRecords.statusOptions.entered') }}</el-tag>
              <el-tag v-else-if="record.status === 'exited'" type="warning">{{ $t('vehicleRecords.statusOptions.exited') }}</el-tag>
              <el-tag v-else-if="record.status === 'exit_only'" type="danger">{{ $t('vehicleRecords.statusOptions.exitOnly') }}</el-tag>
            </el-descriptions-item>
            <el-descriptions-item :label="$t('vehicleRecords.durationSeconds')">
              {{ formatDuration(record.durationSeconds) }}
            </el-descriptions-item>
            <el-descriptions-item :label="$t('vehicleRecords.parkingDurationMinutes')">
              {{ record.parkingDurationMinutes || '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="停车费">
              <span v-if="record.parkingFeeCents" style="font-size: 18px; font-weight: bold; color: #E6A23C;">
                ${{ (record.parkingFeeCents / 100).toFixed(2) }}
              </span>
              <span v-else>-</span>
            </el-descriptions-item>
            <el-descriptions-item label="支付状态">
              <el-tag v-if="record.paymentStatus === 'paid'" type="success" size="medium">已支付</el-tag>
              <el-tag v-else-if="record.paymentStatus === 'pending'" type="warning" size="medium">待支付</el-tag>
              <el-tag v-else-if="record.parkingFeeCents > 0" type="info" size="medium">未支付</el-tag>
              <span v-else>-</span>
            </el-descriptions-item>
            <el-descriptions-item label="支付方式">
              <span v-if="record.squarePaymentId">
                <el-tag type="primary" size="small">终端支付</el-tag>
                <span style="margin-left: 10px; color: #909399; font-size: 12px;">
                  支付ID: {{ record.squarePaymentId }}
                </span>
              </span>
              <span v-else-if="record.onlinePaymentUrl && record.paymentStatus === 'paid'">
                <el-tag type="success" size="small">在线支付</el-tag>
              </span>
              <span v-else>-</span>
            </el-descriptions-item>
            <el-descriptions-item label="支付操作" v-if="record.parkingFeeCents > 0 && record.paymentStatus !== 'paid'">
              <!-- 终端支付按钮 -->
              <el-button
                type="primary"
                size="small"
                icon="el-icon-mobile-phone"
                @click="handleTerminalPayment"
              >
                终端支付
              </el-button>
              <!-- 在线支付按钮 -->
              <el-button
                v-if="record.onlinePaymentUrl"
                type="success"
                size="small"
                icon="el-icon-bank-card"
                @click="handleOnlinePayment"
                style="margin-left: 10px;"
              >
                在线支付
              </el-button>
            </el-descriptions-item>
            <el-descriptions-item label="支付状态" v-else-if="record.paymentStatus === 'paid'">
              <span style="color: #67C23A;">
                <i class="el-icon-circle-check"></i> 已完成支付
              </span>
            </el-descriptions-item>
            <el-descriptions-item :label="$t('vehicleRecords.createdAt')">
              {{ formatDateTime(record.createdAt) }}
            </el-descriptions-item>
            <el-descriptions-item :label="$t('vehicleRecords.updatedAt')">
              {{ formatDateTime(record.updatedAt) }}
            </el-descriptions-item>
          </el-descriptions>
        </div>

        <!-- 入场信息 -->
        <div v-if="record.entryPlateNumber" class="section">
          <h3 class="section-title">{{ $t('vehicleRecords.entryInfo') }}</h3>
          <el-row :gutter="20">
            <el-col :xs="24" :md="12">
              <el-descriptions :column="1" border>
                <el-descriptions-item :label="$t('vehicleRecords.plateNumber')">
                  {{ record.entryPlateNumber }}
                </el-descriptions-item>
                <el-descriptions-item :label="$t('vehicleRecords.entryTime')">
                  {{ formatDateTime(record.entryTime) }}
                </el-descriptions-item>
                <el-descriptions-item :label="$t('vehicleRecords.cameraName')">
                  {{ record.entryCameraName || '-' }}
                </el-descriptions-item>
                <el-descriptions-item :label="$t('vehicleRecords.cameraIp')">
                  {{ record.entryCameraIp || '-' }}
                </el-descriptions-item>
                <el-descriptions-item :label="$t('vehicleRecords.cameraId')">
                  {{ record.entryCameraId || '-' }}
                </el-descriptions-item>
                <el-descriptions-item :label="$t('vehicleRecords.eventId')">
                  {{ record.entryEventId || '-' }}
                </el-descriptions-item>
                <el-descriptions-item :label="$t('vehicleRecords.detectionCount')">
                  {{ record.entryDetectionCount || '-' }}
                </el-descriptions-item>
                <el-descriptions-item :label="$t('vehicleRecords.weight')">
                  {{ record.entryWeight || '-' }}
                </el-descriptions-item>
                <el-descriptions-item :label="$t('vehicleRecords.snapshotFile')">
                  {{ record.entrySnapshot || '-' }}
                </el-descriptions-item>
              </el-descriptions>
            </el-col>
            <el-col :xs="24" :md="12">
              <div class="snapshot-container">
                <h4>{{ $t('vehicleRecords.entrySnapshot') }}</h4>
                <el-image
                  v-if="record.entrySnapshot"
                  :src="getSnapshotUrl(record.parkingLotCode, record.entrySnapshot)"
                  :preview-src-list="[getSnapshotUrl(record.parkingLotCode, record.entrySnapshot)]"
                  fit="contain"
                  class="snapshot-image"
                >
                  <div slot="error" class="image-slot">
                    <i class="el-icon-picture-outline"></i>
                    <p>{{ $t('vehicleRecords.noSnapshot') }}</p>
                  </div>
                </el-image>
                <div v-else class="no-snapshot">
                  <i class="el-icon-picture-outline"></i>
                  <p>{{ $t('vehicleRecords.noSnapshot') }}</p>
                </div>
              </div>
            </el-col>
          </el-row>
        </div>

        <!-- 出场信息 -->
        <div v-if="record.exitPlateNumber" class="section">
          <h3 class="section-title">{{ $t('vehicleRecords.exitInfo') }}</h3>
          <el-row :gutter="20">
            <el-col :xs="24" :md="12">
              <el-descriptions :column="1" border>
                <el-descriptions-item :label="$t('vehicleRecords.plateNumber')">
                  {{ record.exitPlateNumber }}
                </el-descriptions-item>
                <el-descriptions-item :label="$t('vehicleRecords.exitTime')">
                  {{ formatDateTime(record.exitTime) }}
                </el-descriptions-item>
                <el-descriptions-item :label="$t('vehicleRecords.cameraName')">
                  {{ record.exitCameraName || '-' }}
                </el-descriptions-item>
                <el-descriptions-item :label="$t('vehicleRecords.cameraIp')">
                  {{ record.exitCameraIp || '-' }}
                </el-descriptions-item>
                <el-descriptions-item :label="$t('vehicleRecords.cameraId')">
                  {{ record.exitCameraId || '-' }}
                </el-descriptions-item>
                <el-descriptions-item :label="$t('vehicleRecords.eventId')">
                  {{ record.exitEventId || '-' }}
                </el-descriptions-item>
                <el-descriptions-item :label="$t('vehicleRecords.detectionCount')">
                  {{ record.exitDetectionCount || '-' }}
                </el-descriptions-item>
                <el-descriptions-item :label="$t('vehicleRecords.weight')">
                  {{ record.exitWeight || '-' }}
                </el-descriptions-item>
                <el-descriptions-item :label="$t('vehicleRecords.snapshotFile')">
                  {{ record.exitSnapshot || '-' }}
                </el-descriptions-item>
              </el-descriptions>
            </el-col>
            <el-col :xs="24" :md="12">
              <div class="snapshot-container">
                <h4>{{ $t('vehicleRecords.exitSnapshot') }}</h4>
                <el-image
                  v-if="record.exitSnapshot"
                  :src="getSnapshotUrl(record.parkingLotCode, record.exitSnapshot)"
                  :preview-src-list="[getSnapshotUrl(record.parkingLotCode, record.exitSnapshot)]"
                  fit="contain"
                  class="snapshot-image"
                >
                  <div slot="error" class="image-slot">
                    <i class="el-icon-picture-outline"></i>
                    <p>{{ $t('vehicleRecords.noSnapshot') }}</p>
                  </div>
                </el-image>
                <div v-else class="no-snapshot">
                  <i class="el-icon-picture-outline"></i>
                  <p>{{ $t('vehicleRecords.noSnapshot') }}</p>
                </div>
              </div>
            </el-col>
          </el-row>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script>
import { getVehicleRecordDetail, getSnapshotUrl, initiatePayment } from '@/api/vehicleRecords'

export default {
  name: 'VehicleRecordDetail',
  data() {
    return {
      loading: false,
      record: null
    }
  },
  created() {
    this.loadDetail()
  },
  methods: {
    async loadDetail() {
      this.loading = true
      try {
        const id = this.$route.params.id
        const response = await getVehicleRecordDetail(id)
        if (response.success) {
          this.record = response.record
        } else {
          this.$message.error(response.message || this.$t('common.loading'))
          this.$router.back()
        }
      } catch (error) {
        console.error('加载详情失败:', error)
        this.$message.error(this.$t('common.loading'))
        this.$router.back()
      } finally {
        this.loading = false
      }
    },
    goBack() {
      this.$router.back()
    },
    async handleTerminalPayment() {
      try {
        const confirmResult = await this.$confirm(
          `确认发起终端支付?\n金额: $${(this.record.parkingFeeCents / 100).toFixed(2)}\n\n是否同时生成在线支付链接?`,
          '终端支付',
          {
            confirmButtonText: '仅终端支付',
            cancelButtonText: '终端+在线',
            distinguishCancelAndClose: true,
            type: 'info'
          }
        ).then(() => 'terminal_only')
          .catch((action) => {
            if (action === 'cancel') {
              return 'both'
            }
            return null
          })

        if (!confirmResult) {
          return
        }

        const loading = this.$loading({
          lock: true,
          text: '正在发起支付...',
          spinner: 'el-icon-loading',
          background: 'rgba(0, 0, 0, 0.7)'
        })

        try {
          const response = await initiatePayment(this.record.id, this.record.exitPaymentDeviceId)

          if (response.success) {
            if (confirmResult === 'both') {
              this.$message.success(response.message)
            } else {
              if (response.terminal.success) {
                this.$message.success('终端支付已发起')
              } else {
                this.$message.error('终端支付发起失败')
              }
            }

            // 刷新详情页数据
            await this.loadDetail()

            // 如果在线支付成功,询问是否打开支付页面
            if (confirmResult === 'both' && response.online.success && response.online.paymentUrl) {
              const openPayment = await this.$confirm(
                '在线支付链接已生成,是否立即打开支付页面?',
                '提示',
                {
                  confirmButtonText: '打开',
                  cancelButtonText: '稍后',
                  type: 'info'
                }
              ).catch(() => false)

              if (openPayment) {
                window.open(response.online.paymentUrl, '_blank')
              }
            }
          } else {
            this.$message.error(response.message || '发起支付失败')
          }
        } finally {
          loading.close()
        }
      } catch (error) {
        console.error('终端支付失败:', error)
        this.$message.error('终端支付失败: ' + (error.message || '未知错误'))
      }
    },
    handleOnlinePayment() {
      if (this.record.onlinePaymentUrl) {
        window.open(this.record.onlinePaymentUrl, '_blank')
        this.$message.success('已打开支付页面，请在新窗口中完成支付')
      } else {
        this.$message.error('支付链接不可用')
      }
    },
    getSnapshotUrl(parkingLotCode, filename) {
      return getSnapshotUrl(parkingLotCode, filename)
    },
    formatDateTime(datetime) {
      if (!datetime) return '-'
      return datetime.replace('T', ' ')
    },
    formatDuration(seconds) {
      if (!seconds) return '-'
      const hours = Math.floor(seconds / 3600)
      const minutes = Math.floor((seconds % 3600) / 60)
      const secs = seconds % 60
      if (hours > 0) {
        return `${hours}h ${minutes}m ${secs}s`
      } else if (minutes > 0) {
        return `${minutes}m ${secs}s`
      } else {
        return `${secs}s`
      }
    }
  }
}
</script>

<style scoped>
.vehicle-record-detail {
  padding: 0;
}

.el-page-header {
  margin-bottom: 20px;
}

.detail-card {
  margin-bottom: 20px;
}

.section {
  margin-bottom: 30px;
}

.section:last-child {
  margin-bottom: 0;
}

.section-title {
  font-size: 18px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 2px solid #409EFF;
}

.snapshot-container {
  height: 100%;
}

.snapshot-container h4 {
  font-size: 14px;
  font-weight: bold;
  color: #606266;
  margin-bottom: 10px;
}

.snapshot-image {
  width: 100%;
  max-height: 400px;
  border: 1px solid #DCDFE6;
  border-radius: 4px;
}

.no-snapshot {
  width: 100%;
  height: 300px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: #F5F7FA;
  border: 1px dashed #DCDFE6;
  border-radius: 4px;
  color: #909399;
}

.no-snapshot i {
  font-size: 48px;
  margin-bottom: 10px;
}

.image-slot {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
  background-color: #F5F7FA;
  color: #909399;
}

.image-slot i {
  font-size: 48px;
  margin-bottom: 10px;
}
</style>
