import React from 'react';
import ReactDOM from 'react-dom';
import { PieChart, Pie, Cell } from 'recharts';
import colorpalette from 'utils/color-array';

export default class PercentagePie extends React.PureComponent {
	static propTypes = {
		value: React.PropTypes.number.isRequired,
		color: React.PropTypes.string
	}
	constructor(props) {
		super(props);
	}
	render() {
		const value = this.props.value;
		const data = [
			{
				name: 'unsupported', 
				value: value,
				color: this.props.color ? this.props.color : colorpalette(value, 120, 0, 45, .8)
			},
			{
				name: 'supported', 
				value: 100 - value,
				color: '#efefef'
			}
		];
		return (
			<div className="percentagepie">
				<PieChart width={42} height={42}>
					<Pie 
						data={data} 
						innerRadius={15} 
						outerRadius={20}
						startAngle={90}
						endAngle={450}
					>
						{
							data.map((item, index) => <Cell key={index} fill={item.color}/>)
						}	
					</Pie>
				</PieChart>
				<span className="value">{data[0].value}</span>
			</div>
		);
	}
}

