<template>
  <div class="payment-orders">
    <!-- 筛选表单 -->
    <el-card class="filter-card">
      <el-form :model="queryParams" label-width="120px" class="filter-form">
        <el-row :gutter="20">
          <el-col :xs="24" :sm="12" :md="6">
            <el-form-item label="支付状态">
              <el-select v-model="queryParams.status" placeholder="请选择" clearable>
                <el-option label="全部" value=""></el-option>
                <el-option label="待处理" value="PENDING"></el-option>
                <el-option label="已完成" value="COMPLETED"></el-option>
                <el-option label="已批准" value="APPROVED"></el-option>
                <el-option label="已失败" value="FAILED"></el-option>
                <el-option label="已取消" value="CANCELED"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12" :md="6">
            <el-form-item label="支付来源">
              <el-select v-model="queryParams.paymentSource" placeholder="请选择" clearable>
                <el-option label="全部" value=""></el-option>
                <el-option label="终端支付" value="TERMINAL"></el-option>
                <el-option label="在线支付" value="ONLINE"></el-option>
                <el-option label="其他" value="OTHER"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12" :md="6">
            <el-form-item label="支付ID">
              <el-input v-model="queryParams.squarePaymentId" placeholder="请输入" clearable></el-input>
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="12" :md="6">
            <el-form-item label="订单ID">
              <el-input v-model="queryParams.orderId" placeholder="请输入" clearable></el-input>
            </el-form-item>
          </el-col>
          <el-col :xs="24" :sm="24" :md="24">
            <el-form-item>
              <el-button type="primary" icon="el-icon-search" @click="handleSearch">搜索</el-button>
              <el-button icon="el-icon-refresh" @click="handleReset">重置</el-button>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </el-card>

    <!-- 数据表格 -->
    <el-card class="table-card">
      <el-table
        v-loading="loading"
        :data="tableData"
        stripe
        border
        style="width: 100%"
        @row-click="handleRowClick">
        <el-table-column prop="id" label="ID" width="80" align="center"></el-table-column>
        <el-table-column prop="squarePaymentId" label="支付ID" min-width="200" show-overflow-tooltip></el-table-column>
        <el-table-column prop="orderId" label="订单ID" min-width="200" show-overflow-tooltip></el-table-column>
        <el-table-column label="支付金额" width="120" align="center">
          <template slot-scope="scope">
            <span v-if="scope.row.amount" style="font-weight: bold; color: #E6A23C;">
              ${{ (scope.row.amount / 100).toFixed(2) }}
            </span>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column label="支付状态" width="120" align="center">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.status === 'COMPLETED'" type="success">已完成</el-tag>
            <el-tag v-else-if="scope.row.status === 'PENDING'" type="warning">待处理</el-tag>
            <el-tag v-else-if="scope.row.status === 'APPROVED'" type="info">已批准</el-tag>
            <el-tag v-else-if="scope.row.status === 'FAILED'" type="danger">已失败</el-tag>
            <el-tag v-else-if="scope.row.status === 'CANCELED'" type="info">已取消</el-tag>
            <el-tag v-else>{{ scope.row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="支付来源" width="120" align="center">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.paymentSource === 'TERMINAL'" type="primary" size="small">终端支付</el-tag>
            <el-tag v-else-if="scope.row.paymentSource === 'ONLINE'" type="success" size="small">在线支付</el-tag>
            <el-tag v-else type="info" size="small">{{ scope.row.paymentSource }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="卡片信息" min-width="180">
          <template slot-scope="scope">
            <span v-if="scope.row.cardBrand && scope.row.last4">
              {{ scope.row.cardBrand }} ****{{ scope.row.last4 }}
            </span>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="180" align="center">
          <template slot-scope="scope">
            {{ formatDateTime(scope.row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120" align="center" fixed="right">
          <template slot-scope="scope">
            <el-button type="text" size="small" @click.stop="viewDetail(scope.row.id)">详情</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination">
        <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="queryParams.page"
          :page-sizes="[10, 20, 50, 100]"
          :page-size="queryParams.pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total">
        </el-pagination>
      </div>
    </el-card>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: 'PaymentOrders',
  data() {
    return {
      loading: false,
      tableData: [],
      total: 0,
      queryParams: {
        page: 1,
        pageSize: 20,
        status: '',
        paymentSource: '',
        squarePaymentId: '',
        orderId: ''
      }
    }
  },
  created() {
    this.loadData()
  },
  methods: {
    async loadData() {
      this.loading = true
      try {
        const params = {
          page: this.queryParams.page,
          pageSize: this.queryParams.pageSize
        }

        if (this.queryParams.status) params.status = this.queryParams.status
        if (this.queryParams.paymentSource) params.paymentSource = this.queryParams.paymentSource
        if (this.queryParams.squarePaymentId) params.squarePaymentId = this.queryParams.squarePaymentId
        if (this.queryParams.orderId) params.orderId = this.queryParams.orderId

        const response = await axios.get('/api/payment-orders', { params })

        if (response.data.success) {
          this.tableData = response.data.records
          this.total = response.data.total
        } else {
          this.$message.error(response.data.message || '加载失败')
        }
      } catch (error) {
        console.error('加载支付记录失败:', error)
        this.$message.error('加载失败: ' + (error.message || '未知错误'))
      } finally {
        this.loading = false
      }
    },
    handleSearch() {
      this.queryParams.page = 1
      this.loadData()
    },
    handleReset() {
      this.queryParams = {
        page: 1,
        pageSize: 20,
        status: '',
        paymentSource: '',
        squarePaymentId: '',
        orderId: ''
      }
      this.loadData()
    },
    handleSizeChange(val) {
      this.queryParams.pageSize = val
      this.queryParams.page = 1
      this.loadData()
    },
    handleCurrentChange(val) {
      this.queryParams.page = val
      this.loadData()
    },
    handleRowClick(row) {
      this.viewDetail(row.id)
    },
    viewDetail(id) {
      this.$router.push(`/payment-orders/${id}`)
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
.payment-orders {
  padding: 0;
}

.filter-card {
  margin-bottom: 20px;
}

.filter-form {
  margin-bottom: 0;
}

.table-card {
  margin-bottom: 20px;
}

.pagination {
  margin-top: 20px;
  text-align: right;
}

.el-table {
  cursor: pointer;
}

.el-table >>> .el-table__row:hover {
  background-color: #f5f7fa;
}
</style>
