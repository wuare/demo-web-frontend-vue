<template>
  <page-header-wrapper>
    <a-card :bordered="false">
      <div class="table-page-search-wrapper">
      </div>

      <a-table
        ref="table"
        size="default"
        rowKey="key"
        :columns="columns"
        :data-source="loadData"
        :alert="true"
      >
        <span slot="serial" slot-scope="text, record, index">
          {{ index + 1 }}
        </span>
      </a-table>
    </a-card>
  </page-header-wrapper>
</template>

<script>
import { getDocList } from '@/api/manage'
const columns = [
  {
    title: '#',
    scopedSlots: { customRender: 'serial' }
  },
  {
    title: '请求路径',
    dataIndex: 'url'
  },
  {
    title: '请求方式',
    dataIndex: 'methodName'
  }
]

export default {
  name: 'TableList',
  data () {
    this.columns = columns
    return {
      loadData: []
    }
  },
  created () {
    const vm = this
    getDocList().then((res) => {
      vm.loadData = res.result
    })
  },
  computed: {
  },
  methods: {
  }
}
</script>
