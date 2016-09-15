import React from 'react';
import ReactDOM from 'react-dom';
import { PieChart, Pie, Cell } from 'recharts';
import colorpalette from 'utils/color-array';

export default class PercentagePie extends React.PureComponent {
	static propTypes = {
		value: React.PropTypes.number.isRequired,
	}
	constructor(props) {
		super(props);
	}
	render() {
		const value = this.props.value;
		const data = [
			{name: 'unsupported', value: value},
			{name: 'supported', value: 100 - value}
		];
		return (
			<div className="percentagepie">
				<PieChart width={40} height={40}>
					<Pie 
						data={data} 
						innerRadius={15} 
						outerRadius={20}
						startAngle={90}
						endAngle={450}
					>
						{
							data.map((item, index) => <Cell key={index} fill={index === 0 ? colorpalette(item.value, 120, 0, 45, .8) : '#efefef'}/>)
						}	
					</Pie>
				</PieChart>
				<span className="value">{data[0].value}</span>
			</div>
		);
	}
}

