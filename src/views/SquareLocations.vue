<template>
  <div class="square-locations">
    <h2>{{ $t('squareLocations.title') }}</h2>

    <!-- 搜索和操作栏 -->
    <el-card class="search-card">
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input
            v-model="searchQuery"
            :placeholder="$t('squareLocations.locationName')"
            clearable
            @clear="handleSearch"
            @keyup.enter.native="handleSearch">
            <el-button slot="append" icon="el-icon-search" @click="handleSearch"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" icon="el-icon-refresh" @click="loadLocations">
            {{ $t('common.refresh') }}
          </el-button>
        </el-col>
      </el-row>
    </el-card>

    <!-- 位置列表 -->
    <el-card class="table-card">
      <el-table
        :data="locations"
        v-loading="loading"
        style="width: 100%"
        @row-click="handleRowClick">
        <el-table-column
          prop="id"
          :label="$t('squareLocations.locationId')"
          width="280">
        </el-table-column>

        <el-table-column
          prop="name"
          :label="$t('squareLocations.locationName')"
          width="200">
        </el-table-column>

        <el-table-column
          prop="businessName"
          :label="$t('squareLocations.businessName')"
          width="200">
        </el-table-column>

        <el-table-column
          prop="address.locality"
          :label="$t('common.address')"
          width="150">
          <template slot-scope="scope">
            {{ formatAddress(scope.row.address) }}
          </template>
        </el-table-column>

        <el-table-column
          prop="status"
          :label="$t('common.status')"
          width="100">
          <template slot-scope="scope">
            <el-tag :type="scope.row.status === 'ACTIVE' ? 'success' : 'info'">
              {{ scope.row.status === 'ACTIVE' ? $t('common.active') : $t('common.inactive') }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column
          prop="currency"
          :label="$t('squareLocations.currency')"
          width="100">
        </el-table-column>

        <el-table-column
          prop="timezone"
          :label="$t('squareLocations.timezone')"
          width="180">
        </el-table-column>

        <el-table-column
          :label="$t('squareLocations.capabilities')"
          width="200">
          <template slot-scope="scope">
            <el-tag
              v-for="capability in scope.row.capabilities"
              :key="capability"
              size="small"
              style="margin-right: 5px; margin-bottom: 3px;">
              {{ formatCapability(capability) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column
          fixed="right"
          :label="$t('common.actions')"
          width="150">
          <template slot-scope="scope">
            <el-button
              type="text"
              size="small"
              @click.stop="viewDetails(scope.row)">
              {{ $t('common.detail') }}
            </el-button>
            <el-button
              v-if="!scope.row.isCurrent"
              type="text"
              size="small"
              @click.stop="setAsCurrent(scope.row)">
              {{ $t('squareLocations.setCurrent') || '设为当前' }}
            </el-button>
            <el-tag v-else type="success" size="small">
              {{ $t('squareLocations.currentLocation') }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
          :current-page="pagination.page"
          :page-sizes="[10, 20, 50, 100]"
          :page-size="pagination.size"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper">
        </el-pagination>
      </div>
    </el-card>

    <!-- 详情对话框 -->
    <el-dialog
      :title="$t('common.detail')"
      :visible.sync="detailDialogVisible"
      width="60%">
      <div v-if="selectedLocation" class="location-detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item :label="$t('squareLocations.locationId')">
            {{ selectedLocation.id }}
          </el-descriptions-item>
          <el-descriptions-item :label="$t('squareLocations.locationName')">
            {{ selectedLocation.name }}
          </el-descriptions-item>
          <el-descriptions-item :label="$t('squareLocations.businessName')">
            {{ selectedLocation.businessName }}
          </el-descriptions-item>
          <el-descriptions-item :label="$t('common.status')">
            <el-tag :type="selectedLocation.status === 'ACTIVE' ? 'success' : 'info'">
              {{ selectedLocation.status }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item :label="$t('squareLocations.merchantId')">
            {{ selectedLocation.merchantId }}
          </el-descriptions-item>
          <el-descriptions-item :label="$t('squareLocations.currency')">
            {{ selectedLocation.currency }}
          </el-descriptions-item>
          <el-descriptions-item :label="$t('squareLocations.timezone')">
            {{ selectedLocation.timezone }}
          </el-descriptions-item>
          <el-descriptions-item :label="$t('squareLocations.mcc')">
            {{ selectedLocation.mcc }}
          </el-descriptions-item>
          <el-descriptions-item :label="$t('common.address')" :span="2">
            {{ formatFullAddress(selectedLocation.address) }}
          </el-descriptions-item>
          <el-descriptions-item :label="$t('squareLocations.coordinates')" :span="2">
            {{ selectedLocation.coordinates ? `${selectedLocation.coordinates.latitude}, ${selectedLocation.coordinates.longitude}` : '-' }}
          </el-descriptions-item>
          <el-descriptions-item :label="$t('squareLocations.capabilities')" :span="2">
            <el-tag
              v-for="capability in selectedLocation.capabilities"
              :key="capability"
              size="small"
              style="margin-right: 5px;">
              {{ formatCapability(capability) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item :label="$t('common.createdAt')" :span="2">
            {{ formatDateTime(selectedLocation.createdAt) }}
          </el-descriptions-item>
        </el-descriptions>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="detailDialogVisible = false">{{ $t('common.close') }}</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: 'SquareLocations',
  data() {
    return {
      locations: [],
      searchQuery: '',
      loading: false,
      pagination: {
        page: 1,
        size: 10,
        total: 0
      },
      detailDialogVisible: false,
      selectedLocation: null
    }
  },
  created() {
    this.loadLocations()
  },
  methods: {
    async loadLocations() {
      this.loading = true
      try {
        const response = await axios.get('/api/square/locations', {
          params: {
            page: this.pagination.page,
            size: this.pagination.size,
            search: this.searchQuery
          }
        })

        if (response.data) {
          this.locations = response.data.content || response.data
          this.pagination.total = response.data.totalElements || this.locations.length
        }
      } catch (error) {
        console.error('Failed to load locations:', error)
        this.$message.error(this.$t('common.loadFailed'))
      } finally {
        this.loading = false
      }
    },

    handleSearch() {
      this.pagination.page = 1
      this.loadLocations()
    },

    handlePageChange(page) {
      this.pagination.page = page
      this.loadLocations()
    },

    handleSizeChange(size) {
      this.pagination.size = size
      this.pagination.page = 1
      this.loadLocations()
    },

    handleRowClick(row) {
      this.viewDetails(row)
    },

    viewDetails(location) {
      this.selectedLocation = location
      this.detailDialogVisible = true
    },

    async setAsCurrent(location) {
      try {
        await axios.post(`/api/square/locations/${location.id}/set-current`)
        this.$message.success(this.$t('common.success') || '操作成功')
        this.loadLocations()
      } catch (error) {
        console.error('Failed to set current location:', error)
        this.$message.error(this.$t('common.failed') || '操作失败')
      }
    },

    formatAddress(address) {
      if (!address) return '-'
      return address.locality || address.administrativeDistrictLevel1 || '-'
    },

    formatFullAddress(address) {
      if (!address) return '-'
      const parts = [
        address.addressLine1,
        address.addressLine2,
        address.locality,
        address.administrativeDistrictLevel1,
        address.postalCode,
        address.country
      ].filter(Boolean)
      return parts.join(', ') || '-'
    },

    formatCapability(capability) {
      const map = {
        'CREDIT_CARD_PROCESSING': this.$t('squareLocations.creditCardProcessing'),
        'AUTOMATIC_TRANSFERS': this.$t('squareLocations.automaticTransfers')
      }
      return map[capability] || capability
    },

    formatDateTime(dateTime) {
      if (!dateTime) return '-'
      const date = new Date(dateTime)
      return date.toLocaleString(this.$i18n.locale === 'zh-CN' ? 'zh-CN' : 'en-US')
    }
  }
}
</script>

<style scoped>
.square-locations {
  padding: 20px;
}

h2 {
  margin-bottom: 20px;
  color: #303133;
}

.search-card {
  margin-bottom: 20px;
}

.table-card {
  margin-top: 20px;
}

.pagination-container {
  margin-top: 20px;
  text-align: right;
}

.location-detail {
  padding: 10px;
}

.el-table {
  cursor: pointer;
}

.el-table__row:hover {
  background-color: #f5f7fa;
}
</style>
