<template>
  <div class="payment-order-detail">
    <el-page-header @back="goBack" content="支付记录详情"></el-page-header>

    <el-card v-loading="loading" class="detail-card">
      <div v-if="record">
        <!-- 基本信息 -->
        <div class="section">
          <h3 class="section-title">基本信息</h3>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="记录ID">{{ record.id }}</el-descriptions-item>
            <el-descriptions-item label="Square支付ID">
              {{ record.squarePaymentId || '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="订单ID">
              {{ record.orderId || '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="Checkout ID">
              {{ record.checkoutId || '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="关联车辆记录ID">
              <span v-if="record.vehicleRecordId">
                <el-link type="primary" @click="goToVehicleRecord(record.vehicleRecordId)">
                  {{ record.vehicleRecordId }}
                </el-link>
              </span>
              <span v-else>-</span>
            </el-descriptions-item>
            <el-descriptions-item label="支付状态">
              <el-tag v-if="record.status === 'COMPLETED'" type="success" size="medium">已完成</el-tag>
              <el-tag v-else-if="record.status === 'PENDING'" type="warning" size="medium">待处理</el-tag>
              <el-tag v-else-if="record.status === 'APPROVED'" type="info" size="medium">已批准</el-tag>
              <el-tag v-else-if="record.status === 'FAILED'" type="danger" size="medium">已失败</el-tag>
              <el-tag v-else-if="record.status === 'CANCELED'" type="info" size="medium">已取消</el-tag>
              <el-tag v-else>{{ record.status }}</el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="支付来源">
              <el-tag v-if="record.paymentSource === 'TERMINAL'" type="primary" size="small">终端支付</el-tag>
              <el-tag v-else-if="record.paymentSource === 'ONLINE'" type="success" size="small">在线支付</el-tag>
              <el-tag v-else-if="record.paymentSource" type="info" size="small">{{ record.paymentSource }}</el-tag>
              <span v-else>-</span>
            </el-descriptions-item>
            <el-descriptions-item label="备注">
              {{ record.note || '-' }}
            </el-descriptions-item>
          </el-descriptions>
        </div>

        <!-- 金额信息 -->
        <div class="section">
          <h3 class="section-title">金额信息</h3>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="支付金额">
              <span v-if="record.amount" style="font-size: 18px; font-weight: bold; color: #E6A23C;">
                {{ record.currency }} ${{ (record.amount / 100).toFixed(2) }}
              </span>
              <span v-else>-</span>
            </el-descriptions-item>
            <el-descriptions-item label="总金额">
              <span v-if="record.totalAmount">
                {{ record.currency }} ${{ (record.totalAmount / 100).toFixed(2) }}
              </span>
              <span v-else>-</span>
            </el-descriptions-item>
            <el-descriptions-item label="批准金额">
              <span v-if="record.approvedAmount">
                {{ record.currency }} ${{ (record.approvedAmount / 100).toFixed(2) }}
              </span>
              <span v-else>-</span>
            </el-descriptions-item>
            <el-descriptions-item label="货币">
              {{ record.currency || '-' }}
            </el-descriptions-item>
          </el-descriptions>
        </div>

        <!-- 卡片信息 -->
        <div v-if="record.cardBrand || record.last4" class="section">
          <h3 class="section-title">卡片信息</h3>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="卡片品牌">
              {{ record.cardBrand || '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="卡号后4位">
              {{ record.last4 ? '****' + record.last4 : '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="卡片类型">
              {{ record.cardType || '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="预付卡类型">
              {{ record.prepaidType || '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="刷卡方式">
              {{ record.entryMethod || '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="卡片状态">
              {{ record.cardStatus || '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="CVV状态">
              {{ record.cvvStatus || '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="AVS状态">
              {{ record.avsStatus || '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="BIN">
              {{ record.cardBin || '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="有效期">
              <span v-if="record.cardExpMonth && record.cardExpYear">
                {{ record.cardExpMonth }}/{{ record.cardExpYear }}
              </span>
              <span v-else>-</span>
            </el-descriptions-item>
          </el-descriptions>
        </div>

        <!-- 设备和位置信息 -->
        <div class="section">
          <h3 class="section-title">设备和位置信息</h3>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="位置ID">
              {{ record.locationId || '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="设备ID">
              {{ record.deviceId || '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="引用ID">
              {{ record.referenceId || '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="来源类型">
              {{ record.sourceType || '-' }}
            </el-descriptions-item>
          </el-descriptions>
        </div>

        <!-- 收据信息 -->
        <div v-if="record.receiptNumber || record.receiptUrl" class="section">
          <h3 class="section-title">收据信息</h3>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="收据编号">
              {{ record.receiptNumber || '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="收据链接">
              <el-link v-if="record.receiptUrl" :href="record.receiptUrl" target="_blank" type="primary">
                查看收据
              </el-link>
              <span v-else>-</span>
            </el-descriptions-item>
          </el-descriptions>
        </div>

        <!-- 时间信息 -->
        <div class="section">
          <h3 class="section-title">时间信息</h3>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="创建时间">
              {{ formatDateTime(record.createdAt) }}
            </el-descriptions-item>
            <el-descriptions-item label="更新时间">
              {{ formatDateTime(record.updatedAt) }}
            </el-descriptions-item>
            <el-descriptions-item label="授权时间">
              {{ formatDateTime(record.authorizedAt) }}
            </el-descriptions-item>
            <el-descriptions-item label="捕获时间">
              {{ formatDateTime(record.capturedAt) }}
            </el-descriptions-item>
          </el-descriptions>
        </div>

        <!-- 风险评估 -->
        <div v-if="record.riskLevel" class="section">
          <h3 class="section-title">风险评估</h3>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="风险级别">
              {{ record.riskLevel || '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="评估时间">
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
