# Timeline
Timeline plugin is a way to visually represent any event across years. It is a single line graphical respresentation of data.


#### Features
- Plots the events with custom tooltip data across years.
- Highlight the months specified within an interval with a marker.
- Custom tooltip data support for the highlighted month.
- Plot gaps between two events with custom tooltip data support.


#### Demo
[Try out the demo: ](http://ankitsaini90.github.io/timeline/)

#### Implementation
* HTML 

```HTML
<div class="test"></div>
```
* Plugin Call

```javascript
    $('.test').timeline(options);
```

* Include the Style Sheet(timeline.css)
* Include the javascript (timleine.js)
* Include the images

## Parameters (Options)

Name  | Default Value | Description
----|-----|-----
data |  | Object of employment details(Mandatory).Format given in example. 
spanColor1 | #2CA8C2 | Color for first employment. 
spanColor2 | #07768D | Color for second employment. 
noRecordColor| #CF8D00| Color for gap 
afterPlot |  | Callback function will be called after timeline is plotted.


#### Example
```javascript
//object format
var timelineData={
				intervalList:{
					"0": {
						startDate: "May 2010",
						endDate: "May 2011",
						highlight:{
							'0':{
								date:'Nov 2010',
								tooltip:'<div>Feature discussion complete</div>'
							},
							'1':{
								date:'Feb 2011',
								tooltip:'<div>Related designs complete</div>'
							},
							'2':{
								date:'May 2011',
								tooltip:'<div>Technical Discussion complete</div>'
							}
						},
						"tooltip":"<div>Phase 1 : Project Discussion</div><div>Points of discussion<ul><li>Feature Discussion</li><li>Design Discussion</li><li>Technical Discussion</li></ul></div>"						
					},
					
					"1": {
						startDate: "April 2011",
						endDate: "May 2013",
						highlight:{
							'0':{
								date:'July 2011',
								tooltip:'<div>Common Features Developed</div>'
							},
							'1':{
								date:'Aug 2012',
								tooltip:'<div>Database schema complete</div>'
							},
							'2':{
								date:'April 2013',
								tooltip:'<div>Project integration complete</div>'
							}
						},
						"tooltip":"<div>Phase 2 : Technical Development</div><div>Phases of Implementation<ul><li>Common Features</li><li>Database Design</li><li>Integration</li></ul></div>"
					},
					"2": {
						startDate: "Jun 2013",
						endDate: "Nov 2013",
						highlight:{
							'0':{
								date:'Sep 2013',
								tooltip:'<div>Manual Testing Complete</div>'
							},
							'1':{
								date:'Nov 2013',
								tooltip:'<div>Automation Testing Complete</div>'
							},
						},
						"tooltip":"<div>Phase 3 : Testing</div><div>Phases of Testing<ul><li>Manual Testing</li><li>Automation Testing</li></ul></div>"			
					}
				}
			};
			
//include this in Html file
<div id="timelineContainer"></div>

//call in js file
$('#timelineContainer').timeline({
			    	data:timelineData,
			    	empColor1:'red',
			    	empColor2:'orange',
			    	eduColor:'pink',
			    	afterPlot:function(){
			    		console.log('timeline plotted');
			    	}
			    });
```

#### Browser Support
* Internet Explorer 7+
* Chrome 14+
* Firefox 3.5+
* Safari 4+
* Opera 10.6+

#### Version
1.0.0

#### Todos

 - Write Tests
 - Include more features
 - Optimization

#### License
MIT

#### Author
[Ankit Saini ](https://github.com/ankitsaini90/)

