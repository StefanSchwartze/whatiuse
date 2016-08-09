import React from 'react';
import ReactDOM from 'react-dom';
import { PieChart, Pie, Cell, Tooltip, Sector, ResponsiveContainer, XAxis } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#F02839'];

export default class PercentagePie extends React.Component {
	static propTypes = {
		data: React.PropTypes.array.isRequired,
	}
	constructor(props) {
		super(props);
	}
	render() {
		return (
			<div className="percentagepie">
				<PieChart width={40} height={40}>
					<Pie 
						data={data} 
						innerRadius={15} 
						outerRadius={20} 
					>
						{
							data.map((entry, index) => <Cell key={index} fill={index === 0 ? '#25bcca' : ''}/>)
						}	
					</Pie>
				</PieChart>
				<span className="value"></span>
			</div>
		);
	}
}

