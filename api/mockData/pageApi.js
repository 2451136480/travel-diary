export default {
	getBanner: () => {
		return {
			code: 1,
			data: {
				bannerList: [{
						image: '/static/imgg/jzz.jpg',
						title: '独立寒秋，湘江北去，橘子洲头。',
					},
					{
						image: '/static/imgg/xz.jpg',
						title: '来到徐州最不能错过的9大景点',
					},
					{
						image: '/static/imgg/deng.jpg',
						title: '记录旅行中的美好瞬间',
					},
					{
						image: '/static/imgg/bigben.jpg',
						title: '分享你的精彩游记',
					},
				]
			},
			msg: ''
		}
	},
	getHomeList: () => {
		return {
			code: 1,
			data: [{
					id: 1,
					title: '天坛公园',
					img: '/static/imgg/jzz.jpg',
					nick:'折木',
					head:'/static/headimg/zm.jpg',
					introduce: '天坛公园（Temple of Heaven），原名"天地坛"，位于北京市东城区天坛内东里7号，始建于明永乐十八年（1420年），明嘉靖九年（1530年）改名为"天坛"，是明清两代皇帝"祭天""祈谷"的场所，总面积273公顷，是中国现存最大的古代祭祀性建筑群。民国七年（1918年）1月1日，辟为天坛公园，对外开放',
					times: '每周一到周五9:00 -- 18:00开放',
					address: ['116.410886', '39.881949']
				},
				{
					id: 2,
					title: '北京故宫',
					img: '/static/imgg/xz.jpg',
					nick:'折木',
					head:'/static/headimg/zm.jpg',
					introduce: '北京故宫（The Imperial Palace）是中国明清两代的皇家宫殿，旧称紫禁城，位于北京中轴线的中心。故宫以三大殿为中心，占地面积约72万平方米，建筑面积约15万平方米，有大小宫殿七十多座，相传故宫一共有9999.5间，实际据1973年专家现场测量故宫有房间8707间',
					times: '每周一到周五9:00 -- 18:00开放',
				},
				{
					id: 3,
					title: '四川九寨沟',
					img: '/static/imgg/bigben.jpg',
					nick:'折木',
					head:'/static/headimg/zm.jpg',
					introduce: '九寨沟国家自然保护区是岷山山系大熊猫A种群的核心地和走廊带，具有典型的自然生态系统，为全国生物多样性保护的核心之一。动植物资源丰富，具有较高的生态保护、科学研究和美学旅游价值。',
					times: '每周一到周五9:00 -- 18:00开放',
				},
				{
					id: 4,
					title: '西安兵马俑',
					img: '/static/imgg/ssds.jpg',
					nick:'折木',
					head:'/static/headimg/zm.jpg',
					introduce: '兵马俑，即秦始皇陵兵马俑，亦简称秦兵马俑或秦俑，是第一批全国重点文物保护单位、第一批中国世界遗产，位于今陕西省西安市临潼区秦始皇陵以东1.5千米处的兵马俑坑内。先后有200多位外国元首和政府首脑参观访问，成为中国古代辉煌文明的一张金字名片，又被誉为世界十大古墓稀世珍宝之一。',
					times: '每周一到周五9:00 -- 18:00开放',
				},
				{
					id: 5,
					title: '大唐不夜城',
					img: '/static/imgg/deng.jpg',
					nick:'折木',
					head:'/static/headimg/zm.jpg',
					introduce: '大唐不夜城步行街，位于陕西省西安市雁塔区的大雁塔脚下，始建于2002年8月，北起大雁塔北广场，南至开元广场，东起慈恩东路，西至慈恩西路，街区南北长2100米，东西宽500米，总建筑面积65万平方米，是全国唯一一个以盛唐文化为背景的大型仿唐建筑群步行街，为西安地标性景区。',
					times: '全天开放',
				},
				{
					id: 6,
					title: '黄山',
					img: '/static/imgg/glm.jpg',
					nick:'折木',
					head:'/static/headimg/zm.jpg',
					introduce: '黄山，古称黟山，位于安徽省黄山市境内，地处安徽省南部、黄山市北部，地跨歙县、休宁县、黟县和黄山区、徽州区，东起黄狮岭，西至小岭脚，北始二龙桥，南达汤口镇，地跨东经118°01′至118°17′、北纬30°01′至30°18′，山境南北长约40千米，东西宽约30千米',
					times: '每周一到周五9:00 -- 18:00开放',
				},
				{
					id: 7,
					title: '杭州西湖',
					img: '/static/imgg/xz.jpg',
					nick:'折木',
					head:'/static/headimg/zm.jpg',
					introduce: '西湖，又名钱塘湖，位于中国浙江省杭州市西湖区龙井路1号，杭州市区西部，汇水面积为21.22平方千米，湖面面积为6.38平方千米，为江南三大名湖之一',
					times: '全天开放',
				},
				{
					id: 8,
					title: '记录旅行中的美好瞬间',
					img: '/static/imgg/jzz.jpg',
					nick: '旅行者',
					head: '/static/headimg/zm.jpg',
					introduce: '旅行是一种放松身心的方式，也是开阔视野的途径。在旅途中，我们会遇到各种各样的人和事，这些都是我们宝贵的回忆。通过记录这些美好瞬间，我们可以在日后重温这些回忆，感受当时的喜悦和感动。',
					times: '全天开放',
					createTime: '2023-12-25T12:34:56Z'
				},
				{
					id: 9,
					title: '分享你的精彩游记',
					img: '/static/imgg/xz.jpg',
					nick: '行者无疆',
					head: '/static/headimg/zm.jpg',
					introduce: '每一次旅行都是一个故事，每一个故事都值得被分享。通过分享你的游记，不仅可以帮助其他旅行者规划行程，还可以与志同道合的人交流心得。让我们一起用文字和图片，记录下旅途中的点点滴滴。',
					times: '全天开放',
					createTime: '2023-12-30T15:45:30Z'
				},
				{
					id: 10,
					title: '伦敦塔桥之旅',
					img: '/static/imgg/bigben.jpg',
					nick: '世界漫游者',
					head: '/static/headimg/zm.jpg',
					introduce: '伦敦塔桥是英国伦敦的一座横跨泰晤士河的桥梁，位于伦敦塔附近，是一座上开悬索桥，完工于1894年。塔桥全长244米，分为5个跨度，中央跨度可以开启，以便让高桅杆的船只通过。两座桥塔高度为65米，内部装有升降桥的机械装置，游客可以参观。',
					times: '9:30 -- 17:30开放',
					createTime: '2024-01-15T09:22:18Z'
				},
				{
					id: 11,
					title: '巴黎埃菲尔铁塔一日游',
					img: '/static/imgg/glm.jpg',
					nick: '旅途随心',
					head: '/static/headimg/zm.jpg',
					introduce: '埃菲尔铁塔是法国巴黎的标志性建筑，位于塞纳河南岸的战神广场，于1889年建成。铁塔高300米，天线高24米，总高324米。埃菲尔铁塔是世界著名建筑，始终吸引着世界各地的游客前来参观。登上铁塔可以俯瞰巴黎全景，感受这座浪漫之都的魅力。',
					times: '9:00 -- 23:45开放',
					createTime: '2024-02-01T14:30:45Z'
				},
				{
					id: 12,
					title: '日本樱花季',
					img: '/static/imgg/ssds.jpg',
					nick: '东方旅者',
					head: '/static/headimg/zm.jpg',
					introduce: '日本的樱花季一般在3月底到4月初，是日本旅游的黄金时段。在这段时间里，可以欣赏到漫天飞舞的樱花，体验日本传统的赏樱文化。从东京的上野公园到京都的哲学之道，再到大阪的造币局樱花通，都是著名的赏樱胜地。',
					times: '全天开放',
					createTime: '2024-01-10T10:15:20Z'
				},
				{
					id: 13,
					title: '夜游上海外滩',
					img: '/static/imgg/deng.jpg',
					nick: '城市探索者',
					head: '/static/headimg/zm.jpg',
					introduce: '上海外滩是上海市中心的一个区域，位于黄浦江畔，与浦东陆家嘴隔江相望，是上海的标志性景点之一。外滩沿岸聚集了许多具有不同风格的优秀历史建筑，被称为"万国建筑博览群"。夜幕降临后，灯光璀璨的外滩更是美轮美奂，是拍摄上海夜景的绝佳地点。',
					times: '全天开放',
					createTime: '2024-01-05T19:45:30Z'
				},
				{
					id: 14,
					title: '探秘希腊圣托里尼',
					img: '/static/imgg/jzz.jpg',
					nick: '蓝白梦境',
					head: '/static/headimg/zm.jpg',
					introduce: '圣托里尼是希腊爱琴海基克拉泽斯群岛中的一个岛屿，以其壮观的景色、浪漫的日落、白色的建筑和蓝色的屋顶闻名于世。圣托里尼还以其独特的火山地貌、美丽的黑沙滩和红沙滩以及丰富的历史文化吸引着众多游客。在这里，你可以尽情享受爱琴海的阳光和海风。',
					times: '全天开放',
					createTime: '2024-01-20T11:30:15Z'
				},
				{
					id: 15,
					title: '澳大利亚大堡礁潜水体验',
					img: '/static/imgg/xz.jpg',
					nick: '海洋漫游者',
					head: '/static/headimg/zm.jpg',
					introduce: '大堡礁是世界最大最长的珊瑚礁群，位于澳大利亚东北部的珊瑚海中，绵延2000多公里。大堡礁拥有世界上最丰富多样的生态系统，有1500多种鱼类、400多种珊瑚、4000多种软体动物和240多种鸟类。潜水是探索大堡礁的最佳方式，可以近距离观察丰富多彩的海洋生物和美丽的珊瑚礁。',
					times: '8:00 -- 17:00开放',
					createTime: '2023-12-15T08:20:10Z'
				}
			],
			msg: ''
		}
	}
}