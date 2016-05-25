// *Timeline - v1.0.0 - 24-may-2016
// * Copyright (c) 2016 Ankit Saini; Licensed MIT */
/*
 * jQuery Timeline Plugin
 * http://github.com/ankitsaini90
 *
 * @version 1.0.0
 *
 */


(function($) {

    var proto_timeline = (function() {
        var defaultOptions = {
            spanColor1: '#2CA8C2',
            spanColor2: '#07768D',
            noRecordColor: '#CF8D00'
        };

        var timelineOptions,
            dimensions = {},
            freeTime = [];

        var plotTimeline = function(options) {
            timelineOptions = $.extend(true, {}, defaultOptions, options);
            freeTime = []; //resetting freetime array for every new timeline

            var timelineDataObj = removeException(changeDateFormat(timelineOptions.data));
            timeline(timelineDataObj);

            /*
            intializing some variables required
             */
            var currentSpan = -1,
                spanArr = [],
                currentPtr = 0,
                lastSpan = {},
                color = timelineOptions.spanColor1,
                spanPtr = [];

            //plotting interval timeline
            $.each(timelineDataObj.intervalList, function(spanName, spanDetails) {
                lastSpan = spanDetails;
                spanArr.push(spanDetails);
                currentSpan++;
                var diffrenceBetween = 0,
                    diffrenceBetweenCommonTime = 0;
                if (spanArr.length > 1) {
                    date2 = new Date(spanArr[currentSpan].startDate);
                    date1 = new Date(spanArr[currentSpan - 1].endDate);
                    diffrenceBetween = monthDiff(date1, date2, 'in');

                    diffrenceBetweenCommonTime = monthDiff(date2, date1);
                    diffrenceBetweenCommonTime = diffrenceBetweenCommonTime > 0 ? diffrenceBetweenCommonTime + 1 : diffrenceBetweenCommonTime;
                    if (date2.valueOf() == date1.valueOf()) {
                        diffrenceBetweenCommonTime = 1;
                    }
                }
                if (diffrenceBetween > 0) {
                    freeTime.push({
                        startDate: new Date(date1.setMonth(date1.getMonth() + 1)),
                        endDate: new Date(date2.setMonth(date2.getMonth() - 1)),
                        diffrenceBetween: diffrenceBetween,
                        startPtr: currentPtr,
                        spanInd: spanArr[currentSpan].index + 1
                    });
                }


                var tempPtr = currentPtr = currentPtr + diffrenceBetween,
                    currentPtrTmp = currentPtr;
                highlightObj = [];

                if (spanDetails.highlight) {
                    for (var key in spanDetails.highlight) {
                        var date = spanDetails.highlight[key].date;
                        if (checkIfDateInBetween(spanDetails.startDate, spanDetails.endDate, date)) {
                            highlightObj.push({
                                ptr: tempPtr + monthDiff(spanDetails.startDate, date) - diffrenceBetweenCommonTime,
                                tooltip: spanDetails.highlight[key].tooltip,
                                date: spanDetails.highlight[key].date
                            });
                        }
                    }
                }

                while (currentPtr < currentPtrTmp + (spanDetails.months - diffrenceBetweenCommonTime)) {

                    if (highlightObj) {
                        for (var i = 0; i < highlightObj.length; i++) {
                            if (currentPtr == highlightObj[i].ptr) {
                                spanDetails.highlightTooltip = highlightObj[i].tooltip;
                                spanDetails.highlightPtr = highlightObj[i].ptr;
                                spanDetails.highlightDate = highlightObj[i].date;
                            }
                        }
                    }
                    plotInTable(currentPtr, color, spanDetails, 'interval_' + currentSpan, "span");
                    currentPtr++;
                }

                spanArr[currentSpan].endPtr = currentPtr;
                spanArr[currentSpan].color = color;
                color = (color == timelineOptions.spanColor2) ? timelineOptions.spanColor1 : timelineOptions.spanColor2;
            });

            //for tootip calculation
            dimensions.tableOffLeft = timelineOptions.node.find(".timelineTable").offset().left;
            dimensions.tableWidth = timelineOptions.node.find(".timelineTable").width();
            dimensions.windowWidth = window.screen.width;
            dimensions.leftRightGap = dimensions.windowWidth - (dimensions.tableWidth - dimensions.tableOffLeft);


            //free time plotting
            $.each(freeTime, function(key, val) {
                var freeStartDate = val.startDate,
                    freeEndDate = val.endDate;

                if (val.specialIntPlotted === undefined) {
                    currentPtr = val.startPtr;
                    var currentPtrTmp = currentPtr;
                    while (currentPtr < currentPtrTmp + val.diffrenceBetween) {
                        plotInTable(currentPtr, timelineOptions.noRecordColor, {
                            startDate: convertDateToString(val.startDate),
                            endDate: convertDateToString(val.endDate),
                            months: monthDiff(val.startDate, val.endDate) + 1
                        }, 'iconStripes', 'norecord');
                        currentPtr++;
                    }
                    val.noRecPlotted = true;
                }
            });

            /*
            calling the callback
             */
            if (timelineOptions.afterPlot) timelineOptions.afterPlot();
        };

        function objLen(obj) {
            var count = 0;
            for (var i in obj) {
                if (obj.hasOwnProperty(i)) {
                    count++;
                }
            }
            return count;
        }

        function checkIE8() {
            if (/MSIE (\d+\.\d+);/.test(navigator.userAgent)) { //test for MSIE x.x;
                var ieversion = new Number(RegExp.$1); // capture x.x portion and store as a number
                if (ieversion == 8) {
                    return true;
                }
            }
            return false;
        }

        //for removing span in between a span
        function removeException(timelineObj) {
            var spanLen = objLen(timelineObj.intervalList);
            for (var k in timelineObj.intervalList) {
                var key = parseInt(k);
                for (var i = key + 1; i <= spanLen - 1; i++) {
                    if (timelineObj.intervalList[key] && timelineObj.intervalList[i]) {
                        if (new Date(timelineObj.intervalList[key].endDate) > new Date(timelineObj.intervalList[i].endDate)) {
                            delete timelineObj.intervalList[i];
                        }
                    }
                }
            }
            return timelineObj;
        }

        /*
        function to calculate monthdiff between two dates
         */
        function monthDiff(d1, d2, scope) {
            var months;

            if (!(d2 instanceof Date)) {
                d2 = new Date(d2);
            }
            if (!(d1 instanceof Date)) {
                d1 = new Date(d1);
            }

            months = (d2.getFullYear() - d1.getFullYear()) * 12;

            months -= (scope !== undefined && scope == 'in') ? d1.getMonth() + 1 : d1.getMonth();
            months += d2.getMonth();
            return months <= 0 ? 0 : months;
        }

        /*
        function to append '1' before date to support firefox
         */
        function changeDateFormat(timelineObj) {
            timelineObj.totalTime = {};

            for (var key in timelineObj.intervalList) {
                timelineObj.intervalList[key].startDate = concatOne(timelineObj.intervalList[key].startDate);
                timelineObj.intervalList[key].endDate = concatOne(timelineObj.intervalList[key].endDate);
                timelineObj.intervalList[key].months = monthDiff(timelineObj.intervalList[key].startDate, timelineObj.intervalList[key].endDate) + 1;
                if (timelineObj.intervalList[key].highlight) {
                    for (var innerKey in timelineObj.intervalList[key].highlight) {
                        timelineObj.intervalList[key].highlight[innerKey].date = concatOne(timelineObj.intervalList[key].highlight[innerKey].date);
                    }
                }
                if (key == '0') {
                    timelineObj.totalTime.startDate = timelineObj.intervalList[key].startDate;
                }
                if (parseInt(key) == objLen(timelineObj.intervalList) - 1) {
                    timelineObj.totalTime.endDate = timelineObj.intervalList[key].endDate;
                }
            }

            timelineObj.totalTime.months = monthDiff(timelineObj.totalTime.startDate, timelineObj.totalTime.endDate) + 2;

            return timelineObj;
        }

        /*
        function for appending 1 in dates for firefox issue
         */
        function concatOne(date) {
            return "1 " + date;
        }

        /*
        for calculating months gap between dates
         */
        function getMonthRanges(startDate, endDate) {
            var startYear = (new Date(startDate).getMonth()) ? new Date(startDate).getFullYear() + 1 : new Date(startDate).getFullYear(),
                endYear = new Date(endDate).getFullYear(),
                startMonths = monthDiff(startDate, '1 Jan ' + startYear),
                endMonths = monthDiff('1 Jan ' + endYear, endDate);

            return {
                startYear: startYear,
                startMonths: startMonths,
                endYear: endYear,
                endMonths: endMonths
            };
        }

        /*
        function to plot month graph above timeline
         */
        function appendMonthGraph(cond, year, className) {
            if (cond) {
                timelineOptions.node.find('.yearGraph').append('<td class="yearBox iconDotted">' +
                    '<div class="yearInner ' + className + '">' +
                    '<div class="year">&#39;' + year + '</div>' +
                    '<em class="iconYear"></em>' +
                    '</div>' +
                    '</td>');
            } else {
                timelineOptions.node.find('.yearGraph').append('<td class="iconDotted"></td>');
            }
        }


        /*
        function for plooting basic structure of years line and months units below
         */
        function timeline(timelineData) {

            timelineOptions.node.append('<table class="timelineTable" width="100%" cellpadding="0" cellspacing="0">' +
                '<tr id="yearGraph" class="yearGraph"></tr>' +
                '<tr id="timeline" class="timeline"></tr>' +
                '</table>');

            var timeObj = getMonthRanges(timelineData.totalTime.startDate, timelineData.totalTime.endDate),
                startDate = new Date(timelineData.totalTime.startDate),
                endDate = new Date(timelineData.totalTime.endDate),
                counter = 1;

            for (var i = 1; i <= timeObj.startMonths; i++) {
                // appendMonthGraph(i === 1, (timeObj.startYear - 1).toString().substring(2), 'leftYear');
                appendMonthGraph(false);
            }

            for (var i = timeObj.startYear; i <= timeObj.endYear; i++) {
                if (i === timeObj.endYear && timeObj.endMonths === 0) {
                    appendMonthGraph(true, i.toString().substring(2), 'rightYear');
                } else if (i === timeObj.startYear && timeObj.startMonths === 0) {
                    appendMonthGraph(true, i.toString().substring(2), 'leftYear');
                } else {
                    appendMonthGraph(true, i.toString().substring(2));
                }
                if (i != timeObj.endYear) {
                    var j = 0;
                    while (j < 11) {
                        appendMonthGraph(false);
                        j++;
                    }
                }
            }

            for (var i = timelineData.totalTime.months - timeObj.endMonths; i <= timelineData.totalTime.months - 1; i++) {
                appendMonthGraph(false);
            }

            for (var i = 0; i < timelineData.totalTime.months; i++) {
                timelineOptions.node.find('.timeline').append('<td class="timelineMonth"><span>-</span></td>');
            }

        }

        function toYears(totalMonths) {
            var years = Math.floor(totalMonths / 12);
            var months = totalMonths % 12;

            if (years > 0 && months > 0) {
                return years + " Year(s) " + months + " Month(s)";
            } else if (years === 0 && months > 0) {
                return months + " Month(s)";
            } else if (years > 0 && months === 0) {
                return years + " Year(s)";
            } else if (months === 0 && years === 0) {
                return "Less than a month";
            }

        }

        /*
        function to handle all tooltips diplayed on timeline
        */
        function tooltipTpl(description, type, _this, dimensions) {
            var timelineData = timelineOptions.data;
            var startD = "",
                endD = "";

            if (description.startDate !== undefined && (type == "span" || type == "norecord")) {
                startD = description.startDate.split(' ')[1].substring(0, 3) + " " + description.startDate.split(' ')[2];
            }
            if (description.endDate !== undefined && (type == "span" || type == "norecord")) {
                endD = description.endDate.split(' ')[1].substring(0, 3) + " " + description.endDate.split(' ')[2];
            }
            if ((new Date().getMonth() == new Date(description.endDate).getMonth()) && (new Date().getFullYear() == new Date(description.endDate).getFullYear()) && description.status !== undefined) {
                endD = "Present";
            }

            var timeDiff = toYears(monthDiff(description.startDate, description.endDate));

            switch (type) {
                case 'highlight':
                    if ((dimensions.windowWidth - $(_this).offset().left) < dimensions.leftRightGap) {
                        var tooltipCont = '<div class="timelineTooltip tltpLeft">' +
                            '<div class="spanName wrdWrap bold">' + description.highlightTooltip + '</div>' +
                            '<div class="exp">' + description.highlightDate.substring(2) + '</div><em class="iconTltp arrowTopRight"></em>' +
                            '</div>';
                    } else {
                        var tooltipCont = '<div class="timelineTooltip tltpRight">' +
                            '<div class="spanName wrdWrap bold">' + description.highlightTooltip + '</div>' +
                            '<div class="exp">' + description.highlightDate.substring(2) + '</div><em class="iconTltp arrowTopLeft"></em>' +
                            '</div>';
                    }
                    return tooltipCont;
                case 'span':
                    if ((dimensions.windowWidth - $(_this).offset().left) < dimensions.leftRightGap) {
                        var tooltipCont = '<div class="timelineTooltip tltpLeft">' +
                            '<div class="spanName wrdWrap bold">' + description.tooltip + '</div>' +
                            '<div class="exp">' + startD + ' - ' + endD + ' (' + timeDiff + ')</div><em class="iconTltp arrowTopRight"></em>' +
                            '</div>';
                    } else {
                        var tooltipCont = '<div class="timelineTooltip tltpRight">' +
                            '<div class="spanName wrdWrap bold">' + description.tooltip + '</div>' +
                            '<div class="exp">' + startD + ' - ' + endD + ' (' + timeDiff + ')</div><em class="iconTltp arrowTopLeft"></em>' +
                            '</div>';
                    }
                    return tooltipCont;
                case 'norecord':
                    if (endD == startD) {
                        endD = '';
                    }

                    if ((dimensions.windowWidth - $(_this).offset().left) < dimensions.leftRightGap) {
                        var tooltipCont = '<div class="timelineTooltip tltpLeft">' +
                            '<div class="spanName"><em class="iconTltp arrowTopRight"></em>' + (timelineData.gapText ? timelineData.gapText : '<div class="bold">No Record</div>') + '<div class="exp">' + startD + (endD == '' ? '' : ' - ' + endD) + ' (' + timeDiff + ')</div></div>' +
                            '</div>';
                    } else {
                        var tooltipCont = '<div class="timelineTooltip tltpRight">' +
                            '<div class="spanName"><em class="iconTltp arrowTopLeft"></em>' + (timelineData.gapText ? timelineData.gapText : '<div class="bold">No Record</div>') + '<div class="exp">' + startD + (endD == '' ? '' : ' - ' + endD) + ' (' + timeDiff + ')</div></div>' +
                            '</div>';
                    }
                    return tooltipCont;
            }
        }

        function checkIfDateInBetween(startDate, endDate, dateToChk) {
            if (new Date(dateToChk) >= new Date(startDate) && (new Date(dateToChk) <= new Date(endDate))) {
                return true;
            }
            return false;
        }

        /*
        function to plot timeline
         */
        function plotInTable(ptr, color, desc, className, type) {
            var month = timelineOptions.node.find('.timeline').children().eq(ptr).css('backgroundColor', color);
            if (className !== undefined) {
                month.addClass(className);
            }

            var newDesc = {};
            $.extend(true, newDesc, desc);

            if (newDesc.highlightPtr == ptr) {
                month.append('<em class="iconLastUpdate"></em>');
                type = "highlight";
            }

            month.on('mouseenter', function(event) {
                event.preventDefault();
                month.append(tooltipTpl(newDesc, type, this, dimensions));
            }).on('mouseleave', function(event) {
                event.preventDefault();
                month.children('div').remove();
            });

        }

        function convertDateToString(date) {
            var year = date.getFullYear(),
                month = date.getMonth(),
                months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
            month = months[month];
            return concatOne(month + ' ' + year);
        }

        return {
            plotTimeline: plotTimeline
        };
    }());

    $.fn.timeline = function(options) {

        return $.each(this, function(a, b) {
            var obj = null;
            if (options) {
                options.node = $(b);
                obj = new constructor(options);
                $(b).data('timeline', obj);
            }
        });
    };

    var constructor = function(options) {
        this.plotTimeline(options);
    };

    constructor.prototype = proto_timeline;

}(jQuery));