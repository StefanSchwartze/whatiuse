import React from 'react';
import ReactDOM from 'react-dom';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import {ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line} from 'recharts';

export default class ElementsChart extends React.Component {
	static propTypes = {
		elements: React.PropTypes.array.isRequired,
		orderProp: React.PropTypes.string.isRequired
	}
	constructor(props) {
		super(props);
		this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
	}
	render() {
		return (
			<div className="charts-container">
				<div className="chart-container">
					<ResponsiveContainer>
						<BarChart
							data={
								this.props.elements
									.filter(element => element[this.props.orderProp])
									.sort((a, b) => b[this.props.orderProp] - a[this.props.orderProp])
							}>
							<XAxis dataKey="name"/>
							<YAxis/>
							<CartesianGrid />
							<Tooltip/>
							<Bar dataKey="count" fill="#25bcca" />
						</BarChart>
					</ResponsiveContainer>
				</div>
			</div>
		);
	}
}

