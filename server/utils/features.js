import JSONStream from 'JSONStream';
import { pipe, through, concat } from 'mississippi';
import styles from 'style-stream';
import next from 'next-stream';
import doiuse from 'doiuse/stream';
import prune from './prune';
import unique from './unique';
import limitstream from './limit';

/*
* options must have `url`.
*/
module.exports = function evaluate(args) {

	return new Promise((resolve, reject) => {

		let url = args.url || '';
		let css = args.css || '';
		let browsers = args.browser || '';
		let streams = [styles({ url: url })];
		let errorsAndWarnings = [];
		let uniq = unique();
		let limit = limitstream(1e6);
		let features = prune();



		streams = streams.concat([
			limit,
			doiuse({ browsers: browsers, skipErrors: true }, url.trim().length ? url : 'pasted content')
			.on('warning', function (warn) { 
				errorsAndWarnings.push(warn) 
			}),
			uniq.features,
			features
		]);
		let stringify = features.pipe(JSONStream.stringify());
		let error = through();


		pipe(streams,
			function (err) {
				if (err) {
					console.error('Error processing CSS', err);
					console.trace();
					if (!limit.ended) { 
						limit.end() 
					}
					if (!uniq.ended) { 
						uniq.features.end() 
					}
					stringify.end();
					if (JSON.stringify(err) === '{}') { 
						err = err.toString() 
					}
					errorsAndWarnings.push(err)
				}
				error.end(', "errors":' + JSON.stringify(errorsAndWarnings));
			}
		)
			




var cssstats = require('cssstats');



		let streamF = styles({ url: url });
let feat = '';
		var data = streamF.pipe(through());
		//console.log(data);
		data.on('data', (data) => {
			feat = feat + data.toString('utf8');
			console.log(feat);
		});

		data.on('end', (data) => {
			var stats = cssstats(feat, { mediaQueries: false });
			console.log(stats);
			resolve(stats);
		});





		let usageData = [];
		const concatStream = next([
			'{ "args":', JSON.stringify(args), ',',
			'"usages": ', stringify.pipe(through()), ',',
			'"counts": ', uniq.counts, ',',
			'"size": ', limit.size,
			error,
			'}'
			], { open: false }
		);
		const finalStream = JSONStream.parse();
		concatStream.pipe(finalStream);

		finalStream.on('data', (data) => {
			usageData.push(data);
		});
		finalStream.on('error', (err) => {
			reject(err);
		});
		finalStream.on('end', (err) => {
			//resolve(usageData);
		});

	});
}
