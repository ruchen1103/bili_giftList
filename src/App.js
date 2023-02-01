import './App.css';
import 'antd/dist/antd.min.css';
import { DatePicker, message, Select, Input, Button, Table } from 'antd';
import React from 'react';
import axios from 'axios';
import moment from 'moment';
import { CSVLink } from 'react-csv';


axios.defaults.withCredentials = true;

const { RangePicker } = DatePicker;
const { Option } = Select;

const today=new Date();
class App extends React.Component {
	constructor(props) {
		super(props)
		this.state = {
			giftID: "",
			startTime: today.toLocaleDateString(),
			endTime: today.toLocaleDateString(),
			giftTypeList: [],
			cookie: "",
			inputValue: "",
			giftID: "",
			giftList: [],
			loading: false,
			exportData: [],
		}
	}
	componentDidMount() {
		// var SESSDATA = "SESSDATA=" + "459367fe%2C1680192443%2Cd3be2%2Aa1"
		// document.cookie = SESSDATA;
		var cookie = document.cookie.split(";");
		cookie.map(item => {
			if (item.split("=")[0] == "SESSDATA") {
				this.setState({ cookie: item.split('=')[1] })
			}
		})
		this.getGiftTypeList();
	}
	getGiftList = async (time) => {
		const options = {
			method: 'GET',
			url: '/api/xlive/revenue/v1/giftStream/getReceivedGiftStreamNextList',
			params: { limit: 20, coin_type: '', gift_id: this.state.giftID, begin_time: time, uname: "" },
			withCredentials: true
		};
		axios(options).then(response => {
			if (response.data.code == 0) {
				var list = this.state.giftList.concat(response.data.data.list);
				var exportData = [];
				if (moment(time).format('YYYY-MM-DD') == moment(this.state.endTime).format('YYYY-MM-DD')) {
					list.map(item => {
						var data = {
							"UID": item.uid,
							"昵称": item.uname,
							"礼物类型": item.gift_name,
							"赠送数量": item.gift_num,
							"礼物价值": item.normal_gold,
							"赠送时间": item.time
						}
						exportData.push(data);
					})
					this.setState({ giftList: list, loading: false, exportData: exportData })
				} else {
					this.setState({ giftList: list })
				}
			} else {
				message.warning(response.data.message)
				this.setState({ loading: false })
			}
		}).catch(function (error) {
			message.warning(error.message)
			this.setState({ loading: false })
		});
	}
	getGiftTypeList = async () => {
		const options = {
			method: 'GET',
			url: '/api/gift/v1/master/getGiftTypes',
			withCredentials: true
		};
		axios(options).then(response => {
			if (response.data.message == "success") {
				this.setState({ giftTypeList: response.data.data })
				message.success("登录成功")
			} else {
				message.warning(response.data.message)
			}
		}).catch(function (error) {
			message.warning(error.message)
		});
	}
	timeOnChange = (dates, dateStrings) => {
		this.setState({ startTime: dateStrings[0], endTime: dateStrings[1] })
	}
	onChange = (e) => {
		this.setState({ inputValue: e.target.value })
	}
	setCookie = () => {
		var cookies = this.state.inputValue.split(";");
		cookies.map(item => {
			document.cookie = item.trim(' ');
		})
		this.setState({ cookie: this.state.inputValue }, () => { this.getGiftTypeList() })
	}
	setGiftTypeId = (id) => {
		this.setState({ giftID: id })
	}
	getAllGiftList = () => {
		let startTime = new Date(this.state.startTime);
		let endTime = new Date(this.state.endTime);
		this.setState({ giftList: [], loading: true });
		var index = 1;
		for (let i = startTime; i <= endTime; i = new Date(i.setDate(i.getDate() + 1))) {
			let time = moment(i).format('YYYY-MM-DD');
			setTimeout(() => {
				this.getGiftList(time);
			}, 1000 * index);
			index++;
		}
	}
	render() {
		const { giftTypeList, giftList, loading, exportData } = this.state;
		const columns = [
			{
				title: 'UID',
				dataIndex: 'uid',
				key: 'uid',
			},
			{
				title: '昵称',
				dataIndex: 'uname',
				key: 'uname',
			},
			{
				title: '礼物类型',
				dataIndex: 'gift_name',
				key: 'gift_name',
			},
			{
				title: '赠送数量',
				dataIndex: 'gift_num',
				key: 'gift_num',
			},
			{
				title: '礼物价值',
				dataIndex: 'normal_gold',
				key: 'normal_gold',
			},
			{
				title: '赠送时间',
				dataIndex: 'time',
				key: 'time',
			},
		]
		return (
			<div className="App">
				<div style={{ textAlign: 'left', width: '800px' }}>
					<h1 style={{ textAlign: 'center' }}>B站礼物流水查询</h1>
					<label>SESSDATA：</label>
					<Input style={{ width: '300px' }} placeholder="请设置SESSDATA Cookie" onChange={this.onChange} />
					<Button className='btn' onClick={this.setCookie}>登录</Button>
					<Button className='btn' onClick={this.getAllGiftList}>查询</Button>
					<CSVLink data={exportData} enclosingCharacter={`\t`}>
						导出
					</CSVLink>
					<br />
					<label>礼物类型：</label>
					<Select
						style={{ width: 100 }}
						onSelect={this.setGiftTypeId}
						defaultValue=""
					>
						<Option value="">全部</Option>
						{
							giftTypeList.map(item => {
								return <Option value={item.gift_id}>{item.gift_name}</Option>
							})
						}
					</Select>
					<label>查询时间：</label>
					<RangePicker defaultValue={[moment(today.toLocaleDateString(), 'YYYY/MM/DD'),moment(today.toLocaleDateString(), 'YYYY/MM/DD')]} format="YYYY-MM-DD" onChange={this.timeOnChange} />
					<Table dataSource={giftList} columns={columns} loading={loading} />
				</div>
			</div >
		)
	}
}

export default App;