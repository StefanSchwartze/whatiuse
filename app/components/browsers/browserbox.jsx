import React from 'react';
import ReactDOM from 'react-dom';
import { Link } from 'react-router';
import classnames from 'classnames';
import { PieChart, Pie, Cell, Tooltip, Sector, ResponsiveContainer, XAxis } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#F02839'];

export default class BrowsersBox extends React.Component {
	static propTypes = {
		browser: React.PropTypes.object.isRequired,
		maxVal: React.PropTypes.number.isRequired,
		scope: React.PropTypes.string.isRequired,
		projectId: React.PropTypes.string.isRequired
	}
	constructor(props) {
		super(props);
		this.state = { activeIndex: 0 };
	}
	onPieEnter(data, index) {
		this.setState({ activeIndex: index });
	}
	render() {
		let width = (this.props.browser.completeShare / this.props.maxVal) * 100 + '%';
		const isOpen = this.props.browser.isOpen;
		const baseURL = '/projects/' + this.props.projectId + '/' + this.props.scope + '/browsers/';
		const url = isOpen ? baseURL : baseURL + this.props.browser.alias;
		const data = this.props.browser.version_usage.map((version) => { return {"name": version.version, "value": version.usage }});
		const chart = isOpen ? (<ResponsiveContainer>
								<PieChart width={400} height={200}>
									<Pie data={data}>
										{
											data.map((entry, index) => <Cell key={index} fill={COLORS[index % COLORS.length]}/>)
										}
									</Pie>
									<Tooltip/>
								</PieChart>
							</ResponsiveContainer>) : '';
		return (
			<div className={classnames('browser', isOpen ? 'open' : '')}>
				<Link
					to={url} 
					className="browser-container content-container">
					<div className="browserbox">
						<h3><span className={classnames('icon-' + this.props.browser.alias)}></span>{this.props.browser.browser}</h3>
						<span>{this.props.browser.completeShare.toFixed(2) + ' %'}</span>
					</div>
					<div className="separator"></div>
					<div className="percentagebox">
						<div className="percentagebox-content" style={{width: width}}>
							{this.props.browser.version_usage && this.props.browser.version_usage.map((item, index) =>
								<div className="browser-version" key={index} style={{width: (this.props.browser.version_usage[index].usage / this.props.browser.completeShare) * 100 + '%'}}></div>
							)}
						</div>

					</div>
				</Link>
				<div className="browser-detail">
					<div className="content-container">
						<div className="browser-detail-chart">
							{chart}
						</div>
						<div className="">
							<h2>{this.props.browser.browser}</h2>
							<p>Here we show details about each browser version.
							Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint </p>
						</div>
					</div>
				</div>
			</div>
		);
	}
}

