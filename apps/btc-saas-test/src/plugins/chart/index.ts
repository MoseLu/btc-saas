export const install = (app: any, ctx: any) => {
  // 注册图表组件
  app.component('BtcChart', {
    template: '<div class="btc-chart">图表组件</div>',
    props: ['data'],
    setup(props: any) {
      return { props }
    }
  })
  
  // 注册图表工具方法
  ctx.utils.createChart = (options: any) => {
    return {
      render: () => {
        // 渲染图表
      },
      update: (data: any) => {
        // 更新图表数据
      }
    }
  }
  

}
