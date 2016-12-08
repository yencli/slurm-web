/*
 * Copyright (C) 2015 EDF SA
 *
 * This file is part of slurm-web.
 *
 * slurm-web is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * slurm-web is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with slurm-web.  If not, see <http://www.gnu.org/licenses/>.
 *
 */

define([
  'text!/slurm-web-conf/2d.colors.config.json',
  'text!/slurm-web-conf/3d.colors.config.json'
], function(d2ColorsConfig, d3ColorsConfig) {
  var d2Colors = JSON.parse(d2ColorsConfig),
    d3Colors = JSON.parse(d3ColorsConfig);

  return {
    findJobColor: function(jobId, type) {
      var colors = d2Colors;

      if (type === '3D') {
        colors = d3Colors;
      }

      return colors.JOB[jobId % colors.JOB.length];
    },
    findLedColor: function(node, type) {
      var colors = type === '3D' ? d3Colors : d2Colors,
        stateColor = colors.LED.IDLE,
        nodeColor = colors.LED.UNKNOWN,
        allocatedColor = node.total_cpus === 0
          ? colors.LED.FULLYALLOCATED
          : colors.LED.PARTALLOCATED;

      if (!node || !node.hasOwnProperty('state')) {
        return { node: nodeColor, state: stateColor };
      }

      if (node === null) {
        return { node: nodeColor, state: null };
      }

      switch (node.state) {
        //node state that matches IDLE or IDLE*
      case (node.state.match(/^IDLE\*?[^\+]*$/) || {}).input:
        stateColor = colors.LED.AVAILABLE;
        nodeColor = colors.LED.IDLE;
        break;
        //node state that matches ALLOCATED(*) or MIXED(*) or COMPLETING(*)
      case (node.state.match(/^ALLOCATED\*?[^\+]*$|^MIXED\*?[^\+]*$|^COMPLETING\*?[^\+]*$/) || {}).input:
        nodeColor = allocatedColor;
        stateColor = colors.LED.AVAILABLE;
        break;
        //node state RESERVED(*) or any other state than DOWN, DRAIN, MAINT combining with RESERVED(*)
      case (node.state.match(/^RESERVED\*?[^\+]*|^[^DM][A-Z\*]{3,}\+RESERVED\*?[^\+]*$/) || {}).input:
        nodeColor = allocatedColor;
        stateColor = colors.LED.RESERVED;
        break;
        //node state that matches DRAIN(*), DRAINED(*), DRAINING(*), another state (except DOWN) + DRAINING
      case (node.state.match(/^DRAIN[A-Z]{0,3}\*?\+?[A-Z]*|^[^D][A-Z\*]{3,}\+DRAIN[A-Z]{0,3}\*?[^\+]*$/) || {}).input:
        stateColor = colors.LED.DRAINED;
        nodeColor = colors.LED.UNAVAILABLE;
        break;
        //node state that has a DOWN in it
      case (node.state.match(/DOWN\*?/) || {}).input:
        stateColor = colors.LED.DOWN;
        nodeColor = colors.LED.UNAVAILABLE;
        break;
        //node state that matches MAINT(*), or any other state than DOWN, DRAIN combining with MAINT
      case (node.state.match(/^MAINT\*?\+?[A-Z]*|^[^D][A-Z\*]{3,}\+MAINT\*?[^\+]*$/) || {}).input:
        stateColor = colors.LED.MAINT;
        nodeColor = colors.LED.UNAVAILABLE;
        break;
      default:
        stateColor = colors.LED.NOTVISIBLE;
        nodeColor = colors.LED.UNKNOWN;
        console.warn('Color not handled for node state:', node.state); // eslint-disable-line no-console
      }

      return { node: nodeColor, state: stateColor };
    }
  };
});
