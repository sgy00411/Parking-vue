<template>
  <div class="payment-order-detail">
    <el-page-header @back="goBack" :content="$t('paymentOrders.detailTitle')"></el-page-header>

    <el-card v-loading="loading" class="detail-card">
      <div v-if="record">
        <!-- 基本信息 -->
        <div class="section">
          <h3 class="section-title">{{ $t('paymentOrders.basicInfo') }}</h3>
          <el-descriptions :column="2" border>
            <el-descriptions-item :label="$t('paymentOrders.recordId')">{{ record.id }}</el-descriptions-item>
            <el-descriptions-item :label="$t('paymentOrders.squarePaymentId')">
              {{ record.squarePaymentId || '-' }}
            </el-descriptions-item>
            <el-descriptions-item :label="$t('paymentOrders.orderId')">
              {{ record.orderId || '-' }}
            </el-descriptions-item>
            <el-descriptions-item :label="$t('paymentOrders.checkoutId')">
              {{ record.checkoutId || '-' }}
            </el-descriptions-item>
            <el-descriptions-item :label="$t('paymentOrders.vehicleRecordId')">
              <span v-if="record.vehicleRecordId">
                <el-link type="primary" @click="goToVehicleRecord(record.vehicleRecordId)">
                  {{ record.vehicleRecordId }}
                </el-link>
              </span>
              <span v-else>-</span>
            </el-descriptions-item>
            <el-descriptions-item :label="$t('paymentOrders.status')">
              <el-tag v-if="record.status === 'COMPLETED'" type="success" size="medium">{{ $t('paymentOrders.statusOptions.completed') }}</el-tag>
              <el-tag v-else-if="record.status === 'PENDING'" type="warning" size="medium">{{ $t('paymentOrders.statusOptions.pending') }}</el-tag>
              <el-tag v-else-if="record.status === 'APPROVED'" type="info" size="medium">{{ $t('paymentOrders.statusOptions.approved') }}</el-tag>
              <el-tag v-else-if="record.status === 'FAILED'" type="danger" size="medium">{{ $t('paymentOrders.statusOptions.failed') }}</el-tag>
              <el-tag v-else-if="record.status === 'CANCELED'" type="info" size="medium">{{ $t('paymentOrders.statusOptions.canceled') }}</el-tag>
              <el-tag v-else>{{ record.status }}</el-tag>
            </el-descriptions-item>
            <el-descriptions-item :label="$t('paymentOrders.paymentSource')">
              <el-tag v-if="record.paymentSource === 'TERMINAL'" type="primary" size="small">{{ $t('paymentOrders.paymentSourceOptions.terminal') }}</el-tag>
              <el-tag v-else-if="record.paymentSource === 'ONLINE'" type="success" size="small">{{ $t('paymentOrders.paymentSourceOptions.online') }}</el-tag>
              <el-tag v-else-if="record.paymentSource" type="info" size="small">{{ record.paymentSource }}</el-tag>
              <span v-else>-</span>
            </el-descriptions-item>
            <el-descriptions-item :label="$t('paymentOrders.note')">
              {{ record.note || '-' }}
            </el-descriptions-item>
          </el-descriptions>
        </div>

        <!-- 金额信息 -->
        <div class="section">
          <h3 class="section-title">{{ $t('paymentOrders.amountInfo') }}</h3>
          <el-descriptions :column="2" border>
            <el-descriptions-item :label="$t('paymentOrders.amount')">
              <span v-if="record.amount" style="font-size: 18px; font-weight: bold; color: #E6A23C;">
                {{ record.currency }} ${{ (record.amount / 100).toFixed(2) }}
              </span>
              <span v-else>-</span>
            </el-descriptions-item>
            <el-descriptions-item :label="$t('paymentOrders.totalAmount')">
              <span v-if="record.totalAmount">
                {{ record.currency }} ${{ (record.totalAmount / 100).toFixed(2) }}
              </span>
              <span v-else>-</span>
            </el-descriptions-item>
            <el-descriptions-item :label="$t('paymentOrders.approvedAmount')">
              <span v-if="record.approvedAmount">
                {{ record.currency }} ${{ (record.approvedAmount / 100).toFixed(2) }}
              </span>
              <span v-else>-</span>
            </el-descriptions-item>
            <el-descriptions-item :label="$t('paymentOrders.currency')">
              {{ record.currency || '-' }}
            </el-descriptions-item>
          </el-descriptions>
        </div>

        <!-- 卡片信息 -->
        <div v-if="record.cardBrand || record.last4" class="section">
          <h3 class="section-title">{{ $t('paymentOrders.cardInfo') }}</h3>
          <el-descriptions :column="2" border>
            <el-descriptions-item :label="$t('paymentOrders.cardBrand')">
              {{ record.cardBrand || '-' }}
            </el-descriptions-item>
            <el-descriptions-item :label="$t('paymentOrders.last4')">
              {{ record.last4 ? '****' + record.last4 : '-' }}
            </el-descriptions-item>
            <el-descriptions-item :label="$t('paymentOrders.cardType')">
              {{ record.cardType || '-' }}
            </el-descriptions-item>
            <el-descriptions-item :label="$t('paymentOrders.prepaidType')">
              {{ record.prepaidType || '-' }}
            </el-descriptions-item>
            <el-descriptions-item :label="$t('paymentOrders.entryMethod')">
              {{ record.entryMethod || '-' }}
            </el-descriptions-item>
            <el-descriptions-item :label="$t('paymentOrders.cardStatus')">
              {{ record.cardStatus || '-' }}
            </el-descriptions-item>
            <el-descriptions-item :label="$t('paymentOrders.cvvStatus')">
              {{ record.cvvStatus || '-' }}
            </el-descriptions-item>
            <el-descriptions-item :label="$t('paymentOrders.avsStatus')">
              {{ record.avsStatus || '-' }}
            </el-descriptions-item>
            <el-descriptions-item :label="$t('paymentOrders.cardBin')">
              {{ record.cardBin || '-' }}
            </el-descriptions-item>
            <el-descriptions-item :label="$t('paymentOrders.cardExpiry')">
              <span v-if="record.cardExpMonth && record.cardExpYear">
                {{ record.cardExpMonth }}/{{ record.cardExpYear }}
              </span>
              <span v-else>-</span>
            </el-descriptions-item>
          </el-descriptions>
        </div>

        <!-- 设备和位置信息 -->
        <div class="section">
          <h3 class="section-title">{{ $t('paymentOrders.deviceLocationInfo') }}</h3>
          <el-descriptions :column="2" border>
            <el-descriptions-item :label="$t('paymentOrders.locationId')">
              {{ record.locationId || '-' }}
            </el-descriptions-item>
            <el-descriptions-item :label="$t('paymentOrders.deviceId')">
              {{ record.deviceId || '-' }}
            </el-descriptions-item>
            <el-descriptions-item :label="$t('paymentOrders.referenceId')">
              {{ record.referenceId || '-' }}
            </el-descriptions-item>
            <el-descriptions-item :label="$t('paymentOrders.sourceType')">
              {{ record.sourceType || '-' }}
            </el-descriptions-item>
          </el-descriptions>
        </div>

        <!-- 收据信息 -->
        <div v-if="record.receiptNumber || record.receiptUrl" class="section">
          <h3 class="section-title">{{ $t('paymentOrders.receiptInfo') }}</h3>
          <el-descriptions :column="2" border>
            <el-descriptions-item :label="$t('paymentOrders.receiptNumber')">
              {{ record.receiptNumber || '-' }}
            </el-descriptions-item>
            <el-descriptions-item :label="$t('paymentOrders.receiptUrl')">
              <el-link v-if="record.receiptUrl" :href="record.receiptUrl" target="_blank" type="primary">
                {{ $t('paymentOrders.viewReceipt') }}
              </el-link>
              <span v-else>-</span>
            </el-descriptions-item>
          </el-descriptions>
        </div>

        <!-- 时间信息 -->
        <div class="section">
          <h3 class="section-title">{{ $t('paymentOrders.timeInfo') }}</h3>
          <el-descriptions :column="2" border>
            <el-descriptions-item :label="$t('common.createdAt')">
              {{ formatDateTime(record.createdAt) }}
            </el-descriptions-item>
            <el-descriptions-item :label="$t('common.updatedAt')">
              {{ formatDateTime(record.updatedAt) }}
            </el-descriptions-item>
            <el-descriptions-item :label="$t('paymentOrders.authorizedAt')">
              {{ formatDateTime(record.authorizedAt) }}
            </el-descriptions-item>
            <el-descriptions-item :label="$t('paymentOrders.capturedAt')">
              {{ formatDateTime(record.capturedAt) }}
            </el-descriptions-item>
          </el-descriptions>
        </div>

        <!-- 风险评估 -->
        <div v-if="record.riskLevel" class="section">
          <h3 class="section-title">{{ $t('paymentOrders.riskAssessment') }}</h3>
          <el-descriptions :column="2" border>
            <el-descriptions-item :label="$t('paymentOrders.riskLevel')">
              {{ record.riskLevel || '-' }}
            </el-descriptions-item>
            <el-descriptions-item :label="$t('paymentOrders.riskEvaluationTime')">
              {{ formatDateTime(record.riskEvaluationCreatedAt) }}
            </el-descriptions-item>
          </el-descriptions>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: 'PaymentOrderDetail',
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
        const response = await axios.get(`/api/payment-orders/${id}`)

        if (response.data.success) {
          this.record = response.data.record
        } else {
          this.$message.error(response.data.message || '加载失败')
          this.$router.back()
        }
      } catch (error) {
        console.error('加载详情失败:', error)
        this.$message.error('加载失败: ' + (error.message || '未知错误'))
        this.$router.back()
      } finally {
        this.loading = false
      }
    },
    goBack() {
      this.$router.back()
    },
    goToVehicleRecord(id) {
      this.$router.push(`/vehicle-records/${id}`)
    },
    formatDateTime(datetime) {
      if (!datetime) return '-'
      const dt = datetime.replace('T', ' ').split('+')[0].split('-')[0].split('Z')[0]
      return dt.substring(0, 19)
    }
  }
}
</script>

<style scoped>
.payment-order-detail {
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
</style>
